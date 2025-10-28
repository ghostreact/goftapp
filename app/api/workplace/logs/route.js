import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongo";
import DailyLog, { ATTENDANCE_STATES } from "@/models/DailyLog";
import Internship from "@/models/Internship";
import {
  authorizeRole,
  getUserFromRequest,
} from "@/lib/auth";

function normalizeDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function buildLogFilter(user, searchParams) {
  const filter = {};
  const meta = {};

  if (user.role === "workplace") {
    const workplaceId = user.profile?._id || user.profile;
    if (!workplaceId) {
      throw new Error("missing_workplace_profile");
    }
    filter.workplace = workplaceId;
  } else if (user.role === "teacher") {
    const teacherId = user.profile?._id || user.profile;
    if (!teacherId) {
      throw new Error("missing_teacher_profile");
    }
    meta.teacherId = teacherId;
  } else if (user.role === "student") {
    const studentId = user.profile?._id || user.profile;
    if (!studentId) {
      throw new Error("missing_student_profile");
    }
    filter.student = studentId;
  }

  const internshipId = searchParams.get("internshipId");
  if (internshipId && mongoose.Types.ObjectId.isValid(internshipId)) {
    filter.internship = internshipId;
  }

  const studentIdParam = searchParams.get("studentId");
  if (studentIdParam) {
    if (mongoose.Types.ObjectId.isValid(studentIdParam)) {
      filter.student = studentIdParam;
    } else {
      filter.studentId = studentIdParam.trim();
    }
  }

  const from = normalizeDate(searchParams.get("from"));
  const to = normalizeDate(searchParams.get("to"));

  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  return { filter, meta };
}
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["admin", "teacher", "workplace", "student"]);

    await connectDB();

    const { filter, meta } = buildLogFilter(
      user,
      new URL(request.url).searchParams
    );

    const logs = await DailyLog.find(filter)
      .populate("student")
      .populate("workplace")
      .populate({
        path: "internship",
        populate: ["teacher", "student", "workplace"],
      })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const filteredLogs =
      meta.teacherId
        ? logs.filter(
            (log) =>
              log.internship?.teacher?._id?.toString() ===
              meta.teacherId.toString()
          )
        : logs;

    const data = filteredLogs.map((log) => ({
      ...log,
      _id: log._id.toString(),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/workplace/logs error:", error);
    if (
      [
        "missing_workplace_profile",
        "missing_teacher_profile",
        "missing_student_profile",
      ].includes(error.message)
    ) {
      return NextResponse.json(
        {
          error:
            "ไม่พบโปรไฟล์ที่เชื่อมกับบัญชีนี้ กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะดึงข้อมูลบันทึกฝึกงาน กรุณาลองอีกครั้งภายหลัง",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["workplace"]);

    const workplaceId = user.profile?._id || user.profile;
    if (!workplaceId) {
      return NextResponse.json(
        {
          error:
            "ไม่พบโปรไฟล์สถานประกอบการสำหรับบัญชีนี้ กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 400 }
      );
    }

    const payload = await request.json();
    const date = normalizeDate(payload.date);
    const internshipId = payload.internshipId;
    const tasks = payload.tasks?.trim();
    const attendanceStatus = payload.attendanceStatus?.trim().toLowerCase();
    const behaviorReport = payload.behaviorReport?.trim() || "";
    const hoursWorked =
      payload.hoursWorked !== undefined && payload.hoursWorked !== null
        ? Number(payload.hoursWorked)
        : null;

    const errors = new Set();

    if (!date) errors.add("date");
    if (!internshipId || !mongoose.Types.ObjectId.isValid(internshipId)) {
      errors.add("internshipId");
    }
    if (!tasks) errors.add("tasks");
    if (attendanceStatus && !ATTENDANCE_STATES.includes(attendanceStatus)) {
      errors.add("attendanceStatus");
    }
    if (hoursWorked !== null && (!Number.isFinite(hoursWorked) || hoursWorked < 0 || hoursWorked > 24)) {
      errors.add("hoursWorked");
    }

    if (errors.size) {
      return NextResponse.json(
        {
          error: "ข้อมูลบันทึกไม่ถูกต้อง",
          details: `ฟิลด์ที่ไม่ถูกต้อง: ${Array.from(errors).join(", ")}`,
        },
        { status: 400 }
      );
    }

    await connectDB();

    const internship = await Internship.findById(internshipId)
      .populate("student")
      .populate("teacher")
      .populate("workplace");

    if (!internship) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการฝึกงานนี้" },
        { status: 404 }
      );
    }

    if (internship.workplace?._id?.toString() !== workplaceId.toString()) {
      return NextResponse.json(
        {
          error:
            "คุณสามารถบันทึกกิจกรรมเฉพาะการฝึกงานที่สถานประกอบการของคุณดูแลเท่านั้น",
        },
        { status: 403 }
      );
    }

    const existing = await DailyLog.findOne({
      internship: internship._id,
      date,
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "มีบันทึกสำหรับการฝึกงานและวันที่นี้อยู่แล้ว กรุณาแก้ไขรายการเดิม",
        },
        { status: 409 }
      );
    }

    const log = await DailyLog.create({
      internship: internship._id,
      workplace: workplaceId,
      student: internship.student,
      date,
      attendanceStatus: attendanceStatus || "present",
      hoursWorked,
      tasks,
      behaviorReport,
      submittedBy: user._id,
      submittedAt: new Date(),
    });

    await Internship.findByIdAndUpdate(internship._id, {
      $inc: {
        "metrics.totalLogs": 1,
      },
    });

    return NextResponse.json(
      {
        message: "ส่งบันทึกประจำวันเรียบร้อยแล้ว",
        log: {
          ...log.toObject(),
          _id: log._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/workplace/logs error:", error);

    if (error.message === "unauthorized" || error.message === "forbidden") {
      return NextResponse.json(
        {
          error:
            "คุณไม่มีสิทธิ์ส่งบันทึกสำหรับการฝึกงาน กรุณาเข้าสู่ระบบด้วยบัญชีสถานประกอบการ",
        },
        { status: 401 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        {
          error:
            "มีบันทึกสำหรับการฝึกงานและวันที่นี้อยู่แล้ว กรุณาแก้ไขรายการเดิม",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะส่งบันทึกฝึกงาน กรุณาลองอีกครั้งภายหลัง",
        details: error.message,
      },
      { status: 500 }
    );
  }
}


