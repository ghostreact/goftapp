import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Internship from "@/models/Internship";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import Supervisor from "@/models/Supervisor";
import Evaluation from "@/models/Evaluation";
import { authorizeRole, getUserFromRequest } from "@/lib/auth";

function sanitizeEmail(email) {
  return email?.trim().toLowerCase();
}

function buildFilterByRole(user) {
  if (user.role === "teacher") {
    const teacherId = user.profile?._id || user.profile;
    if (!teacherId) {
      throw new Error("missing_teacher_profile");
    }
    return { teacher: teacherId };
  }

  if (user.role === "supervisor") {
    const supervisorId = user.profile?._id || user.profile;
    if (!supervisorId) {
      throw new Error("missing_supervisor_profile");
    }
    return { supervisor: supervisorId };
  }

  if (user.role === "student") {
    const studentId = user.profile?._id || user.profile;
    if (!studentId) {
      throw new Error("missing_student_profile");
    }
    return { student: studentId };
  }

  return {};
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["admin", "teacher", "supervisor", "student"]);

    await connectDB();

    let filter = {};
    try {
      filter = buildFilterByRole(user);
    } catch (error) {
      const messages = {
        missing_teacher_profile: "ไม่พบข้อมูลครูนิเทศสำหรับบัญชีนี้",
        missing_supervisor_profile: "ไม่พบข้อมูลผู้ควบคุมสำหรับบัญชีนี้",
        missing_student_profile: "ไม่พบนักศึกษาที่เชื่อมกับบัญชีนี้",
      };
      return NextResponse.json(
        { error: messages[error.message] || "ไม่พบข้อมูลผู้ใช้ที่เชื่อมโยง" },
        { status: 400 }
      );
    }

    const internships = await Internship.find(filter)
      .populate("student")
      .populate("teacher")
      .populate("supervisor")
      .sort({ createdAt: -1 })
      .lean();

    if (!internships.length) {
      return NextResponse.json({ data: [] });
    }

    const internshipIds = internships.map((item) => item._id);
    const evaluations = await Evaluation.find({
      internship: { $in: internshipIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    const evaluationSummary = new Map();

    evaluations.forEach((record) => {
      const key = record.internship.toString();
      if (!evaluationSummary.has(key)) {
        evaluationSummary.set(key, {
          teacherCount: 0,
          supervisorCount: 0,
          averageTechnical: 0,
          averageProfessionalism: 0,
          averageCommunication: 0,
          averageProblemSolving: 0,
          lastSubmittedAt: null,
        });
      }

      const group = evaluationSummary.get(key);
      if (record.evaluatorRole === "teacher") {
        group.teacherCount += 1;
      }
      if (record.evaluatorRole === "supervisor") {
        group.supervisorCount += 1;
      }

      const {
        technical = 0,
        professionalism = 0,
        communication = 0,
        problemSolving = 0,
      } = record.scores || {};

      group.averageTechnical += technical;
      group.averageProfessionalism += professionalism;
      group.averageCommunication += communication;
      group.averageProblemSolving += problemSolving;

      if (
        !group.lastSubmittedAt ||
        new Date(record.createdAt) > new Date(group.lastSubmittedAt)
      ) {
        group.lastSubmittedAt = record.createdAt;
      }
    });

    for (const group of evaluationSummary.values()) {
      const total = group.teacherCount + group.supervisorCount;
      if (total > 0) {
        group.averageTechnical =
          Math.round((group.averageTechnical / total) * 10) / 10;
        group.averageProfessionalism =
          Math.round((group.averageProfessionalism / total) * 10) / 10;
        group.averageCommunication =
          Math.round((group.averageCommunication / total) * 10) / 10;
        group.averageProblemSolving =
          Math.round((group.averageProblemSolving / total) * 10) / 10;
      }
    }

    const result = internships.map((item) => {
      const key = item._id.toString();
      const student = item.student
        ? {
            ...item.student,
            _id: item.student._id?.toString(),
          }
        : null;
      const teacher = item.teacher
        ? {
            ...item.teacher,
            _id: item.teacher._id?.toString(),
          }
        : null;
      const supervisor = item.supervisor
        ? {
            ...item.supervisor,
            _id: item.supervisor._id?.toString(),
          }
        : null;

      return {
        ...item,
        _id: key,
        student,
        teacher,
        supervisor,
        evaluationSummary: evaluationSummary.get(key) || null,
      };
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("GET /api/internships error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูลการฝึกงานได้", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["admin", "teacher"]);

    await connectDB();

    const payload = await request.json();
    const { student, teacher, supervisor, internship } = payload;

    if (!student?.email || !teacher?.email || !supervisor?.email) {
      return NextResponse.json(
        { error: "กรุณากรอกอีเมลของนักศึกษา ครูนิเทศ และผู้ควบคุม" },
        { status: 400 }
      );
    }

    const teacherDoc = await Teacher.findOneAndUpdate(
      { email: sanitizeEmail(teacher.email) },
      {
        $set: {
          name: teacher.name,
          phone: teacher.phone,
          department: teacher.department,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const studentDoc = await Student.findOneAndUpdate(
      { email: sanitizeEmail(student.email) },
      {
        $set: {
          name: student.name,
          phone: student.phone,
          university: student.university,
          faculty: student.faculty,
          major: student.major,
          year: student.year,
          teacher: teacherDoc._id,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const supervisorDoc = await Supervisor.findOneAndUpdate(
      {
        email: sanitizeEmail(supervisor.email),
        companyName: supervisor.companyName?.trim(),
      },
      {
        $set: {
          name: supervisor.name,
          phone: supervisor.phone,
          position: supervisor.position,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const focusAreas = Array.isArray(internship?.focusAreas)
      ? internship.focusAreas.filter(Boolean)
      : typeof internship?.focusAreas === "string"
        ? internship.focusAreas
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const deliverables = Array.isArray(internship?.deliverables)
      ? internship.deliverables.filter(Boolean)
      : typeof internship?.deliverables === "string"
        ? internship.deliverables
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const startDate =
      internship?.startDate && !Number.isNaN(Date.parse(internship.startDate))
        ? new Date(internship.startDate)
        : null;
    const endDate =
      internship?.endDate && !Number.isNaN(Date.parse(internship.endDate))
        ? new Date(internship.endDate)
        : null;
    const weeklyHours =
      typeof internship?.weeklyHours === "number"
        ? internship.weeklyHours
        : internship?.weeklyHours
            ? Number.parseInt(internship.weeklyHours, 10)
            : null;

    const internshipDoc = await Internship.create({
      student: studentDoc._id,
      teacher: teacherDoc._id,
      supervisor: supervisorDoc._id,
      projectTitle: internship?.projectTitle,
      objectives: internship?.objectives,
      responsibilities: internship?.responsibilities,
      startDate,
      endDate,
      weeklyHours,
      status: internship?.status || "pending",
      focusAreas,
      deliverables,
      notes: internship?.notes,
    });

    const populated = await internshipDoc
      .populate("student")
      .populate("teacher")
      .populate("supervisor");

    return NextResponse.json(
      {
        message: "บันทึกข้อมูลการฝึกงานเรียบร้อยแล้ว",
        data: {
          ...populated.toObject(),
          _id: populated._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/internships error:", error);

    if (error.message === "unauthorized" || error.message === "forbidden") {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์เข้าถึงการบันทึกข้อมูล" },
        { status: 401 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        {
          error:
            "มีข้อมูลการฝึกงานสำหรับนักศึกษาคนนี้ในสถานประกอบการเดียวกันอยู่แล้ว",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "ไม่สามารถบันทึกข้อมูลการฝึกงานได้", details: error.message },
      { status: 500 }
    );
  }
}
