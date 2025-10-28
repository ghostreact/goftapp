import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Internship from "@/models/Internship";
import User from "@/models/User";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import Workplace from "@/models/Workplace";
import Evaluation from "@/models/Evaluation";
import DailyLog from "@/models/DailyLog";
import WeeklyReport from "@/models/WeeklyReport";
import {
  authorizeRole,
  getUserFromRequest,
  hashPassword,
} from "@/lib/auth";

const VOCATIONAL_ALIASES = [
  "vocational_certificate",
  "vocational",
  "voc",
  "vc",
  "vocational-certificate",
];

const HIGHER_ALIASES = [
  "higher_vocational_certificate",
  "higher_vocational",
  "hvoc",
  "hvc",
  "higher-vocational-certificate",
];

const PROGRAM_YEAR_LIMITS = {
  vocational_certificate: { min: 1, max: 3 },
  higher_vocational_certificate: { min: 1, max: 2 },
};

function sanitizeEmail(email) {
  return email?.trim().toLowerCase() || null;
}

function toDateOrNull(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeProgramType(input) {
  if (!input) return null;
  const normalized = input.toString().trim().toLowerCase();
  if (VOCATIONAL_ALIASES.includes(normalized)) {
    return "vocational_certificate";
  }
  if (HIGHER_ALIASES.includes(normalized)) {
    return "higher_vocational_certificate";
  }
  return null;
}

function splitNameParts(value) {
  if (!value) {
    return { firstName: "", lastName: "" };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }
  const parts = trimmed.split(/\s+/);
  const [firstName = "", ...rest] = parts;
  return { firstName, lastName: rest.join(" ") };
}

function buildFilterByRole(user) {
  if (user.role === "teacher") {
    const teacherId = user.profile?._id || user.profile;
    if (!teacherId) {
      throw new Error("missing_teacher_profile");
    }
    return { teacher: teacherId };
  }

  if (user.role === "workplace") {
    const workplaceId = user.profile?._id || user.profile;
    if (!workplaceId) {
      throw new Error("missing_workplace_profile");
    }
    return { workplace: workplaceId };
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

async function buildEvaluationSummary(internshipIds) {
  const evaluations = await Evaluation.find({
    internship: { $in: internshipIds },
  })
    .sort({ createdAt: -1 })
    .lean();

  const summary = new Map();

  evaluations.forEach((record) => {
    const key = record.internship.toString();
    if (!summary.has(key)) {
      summary.set(key, {
        teacherCount: 0,
        workplaceCount: 0,
        averageTechnical: 0,
        averageProfessionalism: 0,
        averageCommunication: 0,
        averageProblemSolving: 0,
        lastSubmittedAt: null,
      });
    }

    const group = summary.get(key);
    if (record.evaluatorRole === "teacher") {
      group.teacherCount += 1;
    }
    if (record.evaluatorRole === "workplace") {
      group.workplaceCount += 1;
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

  for (const group of summary.values()) {
    const total = group.teacherCount + group.workplaceCount;
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

  return summary;
}

async function buildLogSummary(internshipIds) {
  const logs = await DailyLog.aggregate([
    { $match: { internship: { $in: internshipIds } } },
    {
      $group: {
        _id: "$internship",
        totalLogs: { $sum: 1 },
        lastLogDate: { $max: "$date" },
      },
    },
  ]);

  return new Map(
    logs.map((item) => [
      item._id.toString(),
      {
        totalLogs: item.totalLogs || 0,
        lastLogDate: item.lastLogDate || null,
      },
    ])
  );
}

async function buildWeeklySummary(internshipIds) {
  const reports = await WeeklyReport.aggregate([
    { $match: { internship: { $in: internshipIds } } },
    {
      $group: {
        _id: "$internship",
        totalReports: { $sum: 1 },
        approved: {
          $sum: {
            $cond: [
              { $eq: ["$teacherReview.status", "approved"] },
              1,
              0,
            ],
          },
        },
        needsRevision: {
          $sum: {
            $cond: [
              { $eq: ["$teacherReview.status", "needs_revision"] },
              1,
              0,
            ],
          },
        },
        pending: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ["$teacherReview.status", "pending"] },
                  { $eq: ["$teacherReview.status", null] },
                ],
              },
              1,
              0,
            ],
          },
        },
        lastSubmittedAt: { $max: "$submittedAt" },
      },
    },
  ]);

  return new Map(
    reports.map((item) => [
      item._id.toString(),
      {
        totalReports: item.totalReports || 0,
        approved: item.approved || 0,
        needsRevision: item.needsRevision || 0,
        pending: item.pending || 0,
        lastSubmittedAt: item.lastSubmittedAt || null,
      },
    ])
  );
}

function normalizeStudentInput(payload = {}, teacherId) {
  const errors = new Set();

  const { firstName: fallbackFirst, lastName: fallbackLast } = splitNameParts(
    payload.name
  );

  const firstName = payload.firstName?.trim() || fallbackFirst;
  const lastName = payload.lastName?.trim() || fallbackLast;
  const birthDate = toDateOrNull(payload.birthDate);
  const email = sanitizeEmail(payload.email);
  const studentId = payload.studentId?.trim();
  const programType = normalizeProgramType(payload.programType || payload.level);
  const yearLevelRaw = payload.yearLevel ?? payload.year;
  const yearLevel = yearLevelRaw !== undefined ? Number(yearLevelRaw) : NaN;
  const department = payload.department?.trim();
  const classroom = payload.classroom?.trim();
  const phone = payload.phone?.trim() || "";
  const status = payload.status === "inactive" ? "inactive" : "active";
  const password = payload.password ? String(payload.password) : "";

  if (!studentId) errors.add("studentId");
  if (!firstName) errors.add("firstName");
  if (!lastName) errors.add("lastName");
  if (!birthDate) errors.add("birthDate");
  if (!programType) errors.add("programType");

  if (!Number.isFinite(yearLevel)) {
    errors.add("yearLevel");
  } else {
    const limits = PROGRAM_YEAR_LIMITS[programType];
    if (limits && (yearLevel < limits.min || yearLevel > limits.max)) {
      errors.add("yearLevel");
    }
  }

  if (!department) errors.add("department");
  if (!classroom) errors.add("classroom");
  if (password && password.length < 8) errors.add("password");

  return {
    errors: Array.from(errors),
    data: {
      firstName,
      lastName,
      fullName: [firstName, lastName].filter(Boolean).join(" "),
      birthDate,
      email,
      studentId,
      programType,
      yearLevel: Number.isFinite(yearLevel) ? yearLevel : null,
      department,
      classroom,
      phone,
      status,
      teacherId,
    },
  };
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["admin", "teacher", "workplace", "student"]);

    await connectDB();

    let filter = {};
    try {
      filter = buildFilterByRole(user);
    } catch (error) {
      const messages = {
        missing_teacher_profile:
          "ไม่พบโปรไฟล์ครูสำหรับบัญชีนี้ กรุณาติดต่อผู้ดูแลระบบ",
        missing_workplace_profile:
          "ไม่พบโปรไฟล์สถานประกอบการสำหรับบัญชีนี้ กรุณาติดต่อผู้ดูแลระบบ",
        missing_student_profile:
          "ไม่พบโปรไฟล์นักเรียนสำหรับบัญชีนี้ กรุณาติดต่อผู้ดูแลระบบ",
      };
      return NextResponse.json(
        {
          error:
            messages[error.message] ||
            "ไม่สามารถโหลดข้อมูลการฝึกงานสำหรับบัญชีนี้ได้ กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 400 }
      );
    }

    const internships = await Internship.find(filter)
      .populate("student")
      .populate("teacher")
      .populate("workplace")
      .sort({ createdAt: -1 })
      .lean();

    if (!internships.length) {
      return NextResponse.json({ data: [] });
    }

    const internshipIds = internships.map((item) => item._id);
    const evaluationSummary = await buildEvaluationSummary(internshipIds);
    const logSummary = await buildLogSummary(internshipIds);
    const weeklySummary = await buildWeeklySummary(internshipIds);

    const data = internships.map((item) => {
      const key = item._id.toString();
      const student = item.student
        ? { ...item.student, _id: item.student._id?.toString() }
        : null;
      const teacher = item.teacher
        ? { ...item.teacher, _id: item.teacher._id?.toString() }
        : null;
      const workplace = item.workplace
        ? { ...item.workplace, _id: item.workplace._id?.toString() }
        : null;

      return {
        ...item,
        _id: key,
        student,
        teacher,
        workplace,
        metrics: {
          ...(item.metrics || {}),
          logs: logSummary.get(key) || { totalLogs: 0, lastLogDate: null },
          weeklyReports:
            weeklySummary.get(key) || {
              totalReports: 0,
              approved: 0,
              needsRevision: 0,
              pending: 0,
              lastSubmittedAt: null,
            },
        },
        evaluationSummary: evaluationSummary.get(key) || null,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/internships error:", error);
    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะโหลดข้อมูลการฝึกงาน กรุณาลองอีกครั้งภายหลัง",
        details: error.message,
      },
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
    const { student, teacher, workplace, internship } = payload ?? {};

    if (!student || !teacher || !workplace || !internship) {
      return NextResponse.json(
        {
          error:
            "Student, teacher, workplace, and internship details are all required.",
        },
        { status: 400 }
      );
    }

    const teacherEmail = sanitizeEmail(teacher.email);
    if (!teacherEmail) {
      return NextResponse.json(
        { error: "ต้องระบุอีเมลของครู" },
        { status: 400 }
      );
    }

    const teacherDoc = await Teacher.findOneAndUpdate(
      { email: teacherEmail },
      {
        $set: {
          name: teacher.name?.trim() || "",
          phone: teacher.phone || "",
          department: teacher.department || "",
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const { errors: studentErrors, data: studentData } = normalizeStudentInput(
      student,
      teacherDoc._id
    );

    if (studentErrors.length) {
      return NextResponse.json(
        {
          error: "ข้อมูลนักเรียนไม่ครบถ้วนหรือไม่ถูกต้อง",
          details: `ฟิลด์ที่ขาดหรือไม่ถูกต้อง: ${studentErrors.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const shouldCreateAccount = Boolean(studentData.password);

    const workplaceEmail =
      sanitizeEmail(workplace.email) || sanitizeEmail(workplace.contactEmail);

    if (!workplace.companyName?.trim() || !workplaceEmail) {
      return NextResponse.json(
        {
          error:
            "ต้องระบุชื่อสถานประกอบการและอีเมลผู้ติดต่อเพื่อบันทึกสถานประกอบการฝึกงาน",
        },
        { status: 400 }
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let studentDoc = null;
      let userDoc = null;

      if (shouldCreateAccount) {
        const duplicateUser = await User.findOne({
          $or: [
            { username: studentData.studentId.toLowerCase() },
            ...(studentData.email ? [{ email: studentData.email }] : []),
          ],
        }).session(session);

        if (duplicateUser) {
          await session.abortTransaction();
          return NextResponse.json(
            {
              error:
                "มีผู้ใช้งานที่ใช้รหัสนักศึกษาหรืออีเมลนี้อยู่แล้ว กรุณาเลือกข้อมูลอื่น",
            },
            { status: 409 }
          );
        }

        const existingStudent = await Student.findOne({
          studentId: studentData.studentId,
        }).session(session);

        if (existingStudent) {
          await session.abortTransaction();
          return NextResponse.json(
            {
              error: "รหัสนักศึกษานี้ถูกใช้กับนักเรียนคนอื่นแล้ว",
            },
            { status: 409 }
          );
        }

        const hashedPassword = await hashPassword(studentData.password);

        userDoc = (
          await User.create(
            [
              {
                name: studentData.fullName,
                email: studentData.email,
                username: studentData.studentId.toLowerCase(),
                password: hashedPassword,
                role: "student",
                active: true,
              },
            ],
            { session }
          )
        )[0];

        studentDoc = (
          await Student.create(
            [
              {
                user: userDoc._id,
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                fullName: studentData.fullName,
                name: studentData.fullName,
                birthDate: studentData.birthDate,
                email: studentData.email,
                phone: studentData.phone,
                studentId: studentData.studentId,
                programType: studentData.programType,
                yearLevel: studentData.yearLevel,
                department: studentData.department,
                classroom: studentData.classroom,
                teacher: studentData.teacherId,
                status: studentData.status,
              },
            ],
            { session }
          )
        )[0];

        userDoc.profile = studentDoc._id;
        userDoc.profileModel = "Student";
        await userDoc.save({ session });
      } else {
        studentDoc = await Student.findOneAndUpdate(
          { studentId: studentData.studentId },
          {
            $set: {
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              fullName: studentData.fullName,
              name: studentData.fullName,
              birthDate: studentData.birthDate,
              email: studentData.email,
              phone: studentData.phone,
              programType: studentData.programType,
              yearLevel: studentData.yearLevel,
              department: studentData.department,
              classroom: studentData.classroom,
              teacher: studentData.teacherId,
              status: studentData.status,
            },
          },
          { new: true, session }
        );

        if (!studentDoc) {
          await session.abortTransaction();
          return NextResponse.json(
            {
              error:
                "ไม่พบโปรไฟล์นักเรียน กรุณาสร้างบัญชีนักเรียนก่อนลงทะเบียนฝึกงาน",
            },
            { status: 404 }
          );
        }
      }

      const workplaceDoc = await Workplace.findOneAndUpdate(
        {
          companyName: workplace.companyName.trim(),
          contactEmail: workplaceEmail,
        },
        {
          $set: {
            companyName: workplace.companyName.trim(),
            branchName: workplace.branchName || "",
            contactName:
              workplace.contactName?.trim() || workplace.name || "",
            contactEmail: workplaceEmail,
            contactPhone: workplace.phone || workplace.contactPhone || "",
            contactPosition:
              workplace.contactPosition || workplace.position || "",
            address: workplace.address || "",
            status: workplace.status || "pending",
            notes: workplace.notes || "",
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          session,
        }
      );

      const startDate = toDateOrNull(internship.startDate);
      if (!startDate) {
        await session.abortTransaction();
        return NextResponse.json(
          {
            error:
              "ต้องระบุวันที่เริ่มฝึกงาน กรุณากรอกวันที่ในรูปแบบ ISO (YYYY-MM-DD)",
          },
          { status: 400 }
        );
      }

      const endDate = toDateOrNull(internship.endDate);
      const weeklyHours = internship.weeklyHours
        ? Number.parseInt(internship.weeklyHours, 10)
        : null;

      const focusAreas = Array.isArray(internship.focusAreas)
        ? internship.focusAreas.filter(Boolean)
        : typeof internship.focusAreas === "string"
          ? internship.focusAreas
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [];

      const deliverables = Array.isArray(internship.deliverables)
        ? internship.deliverables.filter(Boolean)
        : typeof internship.deliverables === "string"
          ? internship.deliverables
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [];

      const internshipDoc = (
        await Internship.create(
          [
            {
              student: studentDoc._id,
              teacher: teacherDoc._id,
              workplace: workplaceDoc._id,
              projectTitle: internship.projectTitle?.trim() || "",
              objectives: internship.objectives?.trim() || "",
              responsibilities: internship.responsibilities?.trim() || "",
              startDate,
              endDate,
              weeklyHours,
              status: internship.status || "awaiting_workplace",
              focusAreas,
              deliverables,
              notes: internship.notes || "",
              workplaceApproval: {
                status: "pending",
              },
              weeklyApprovals: [],
              finalAssessment: {
                status: "pending",
              },
            },
          ],
          { session }
        )
      )[0];

      await session.commitTransaction();

      const populated = await internshipDoc.populate([
        { path: "student" },
        { path: "teacher" },
        { path: "workplace" },
      ]);

      return NextResponse.json(
        {
          message: "บันทึกการลงทะเบียนฝึกงานเรียบร้อยแล้ว",
          data: {
            ...populated.toObject(),
            _id: populated._id.toString(),
          },
        },
        { status: 201 }
      );
    } catch (error) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error(
          "POST /api/internships abortTransaction failed:",
          abortError
        );
      }
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("POST /api/internships error:", error);

    if (error.message === "unauthorized" || error.message === "forbidden") {
      return NextResponse.json(
        {
          error:
            "คุณไม่มีสิทธิ์ลงทะเบียนการฝึกงาน กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 401 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        {
          error:
            "พบการลงทะเบียนฝึกงานซ้ำสำหรับนักเรียนและสถานประกอบการคู่นี้",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะลงทะเบียนการฝึกงาน กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ",
        details: error.message,
      },
      { status: 500 }
    );
  }
}










