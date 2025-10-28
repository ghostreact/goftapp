import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongo";
import Internship from "@/models/Internship";
import WeeklyReport from "@/models/WeeklyReport";
import {
  authorizeRole,
  getUserFromRequest,
} from "@/lib/auth";

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildFilter(user, internshipId, searchParams) {
  const filter = { internship: internshipId };

  if (user.role === "workplace") {
    const workplaceId = user.profile?._id || user.profile;
    if (!workplaceId) throw new Error("missing_workplace_profile");
    filter.submittedBy = workplaceId;
  }

  if (user.role === "teacher") {
    // We only filter later by verifying access
  }

  const weekNumber = searchParams.get("weekNumber");
  if (weekNumber) {
    const numericWeek = Number(weekNumber);
    if (Number.isFinite(numericWeek)) {
      filter.weekNumber = numericWeek;
    }
  }

  const from = parseDate(searchParams.get("from"));
  const to = parseDate(searchParams.get("to"));
  if (from || to) {
    filter.weekStart = {};
    if (from) filter.weekStart.$gte = from;
    if (to) filter.weekStart.$lte = to;
  }

  return filter;
}

async function ensureInternshipAccess(internshipId, user) {
  if (!mongoose.Types.ObjectId.isValid(internshipId)) {
    throw new Error("invalid_internship_id");
  }

  await connectDB();

  const internship = await Internship.findById(internshipId)
    .populate("teacher")
    .populate("workplace");

  if (!internship) {
    throw new Error("internship_not_found");
  }

  if (user.role === "teacher") {
    const teacherId = user.profile?._id || user.profile;
    if (!teacherId || internship.teacher?._id?.toString() !== teacherId.toString()) {
      throw new Error("forbidden");
    }
  }

  if (user.role === "workplace") {
    const workplaceId = user.profile?._id || user.profile;
    if (!workplaceId || internship.workplace?._id?.toString() !== workplaceId.toString()) {
      throw new Error("forbidden");
    }
  }

  return internship;
}

export async function GET(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["admin", "teacher", "workplace"]);

    const internship = await ensureInternshipAccess(params.internshipId, user);

    const filter = buildFilter(
      user,
      internship._id,
      new URL(request.url).searchParams
    );

    const reports = await WeeklyReport.find(filter)
      .sort({ weekStart: -1 })
      .lean();

    const data = reports.map((report) => ({
      ...report,
      _id: report._id.toString(),
      internship: internship._id.toString(),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error(
      `GET /api/internships/${params.internshipId}/weekly error:`,
      error
    );

    if (error.message === "internship_not_found") {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการฝึกงานนี้" },
        { status: 404 }
      );
    }

    if (error.message === "invalid_internship_id") {
      return NextResponse.json(
        { error: "รหัสการฝึกงานไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (error.message === "forbidden") {
      return NextResponse.json(
        {
          error:
            "คุณไม่มีสิทธิ์เข้าถึงรายงานประจำสัปดาห์ของการฝึกงานรายการนี้",
        },
        { status: 403 }
      );
    }

    if (["missing_workplace_profile"].includes(error.message)) {
      return NextResponse.json(
        {
          error:
            "ไม่พบโปรไฟล์สถานประกอบการสำหรับบัญชีนี้ กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะโหลดรายงานประจำสัปดาห์ กรุณาลองอีกครั้งภายหลัง",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
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

    const internship = await ensureInternshipAccess(params.internshipId, user);

    const body = await request.json();
    const weekNumber = body.weekNumber
      ? Number.parseInt(body.weekNumber, 10)
      : null;
    const weekStart = parseDate(body.weekStart);
    const weekEnd = parseDate(body.weekEnd);
    const summary = body.workplaceSummary?.trim() || body.summary?.trim() || "";
    const notes = body.workplaceNotes?.trim() || body.notes?.trim() || "";

    const errors = new Set();

    if (!weekNumber || !Number.isFinite(weekNumber) || weekNumber < 1) {
      errors.add("weekNumber");
    }
    if (!weekStart) errors.add("weekStart");
    if (!weekEnd) errors.add("weekEnd");
    if (!summary) errors.add("workplaceSummary");

    if (errors.size) {
      return NextResponse.json(
        {
          error: "ข้อมูลสรุปรายสัปดาห์ไม่ถูกต้อง",
          details: `ฟิลด์ที่ไม่ถูกต้อง: ${Array.from(errors).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const report = await WeeklyReport.findOneAndUpdate(
      {
        internship: internship._id,
        weekStart,
      },
      {
        $set: {
          weekNumber,
          weekStart,
          weekEnd,
          workplaceSummary: summary,
          workplaceNotes: notes,
          submissionStatus: "submitted",
          submittedAt: new Date(),
          submittedBy: workplaceId,
        },
        $setOnInsert: {
          teacherReview: {
            status: "pending",
          },
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json(
      {
        message: "ส่งรายงานประจำสัปดาห์เรียบร้อยแล้ว",
        report: {
          ...report.toObject(),
          _id: report._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      `POST /api/internships/${params.internshipId}/weekly error:`,
      error
    );

    if (error.message === "internship_not_found") {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการฝึกงานนี้" },
        { status: 404 }
      );
    }

    if (
      error.message === "invalid_internship_id" ||
      error.message === "missing_workplace_profile"
    ) {
      return NextResponse.json(
        {
          error:
            "การส่งรายงานประจำสัปดาห์ไม่ถูกต้อง กรุณาตรวจสอบรหัสการฝึกงานแล้วลองใหม่",
        },
        { status: 400 }
      );
    }

    if (error.message === "forbidden") {
      return NextResponse.json(
        {
          error:
            "คุณสามารถส่งรายงานประจำสัปดาห์เฉพาะการฝึกงานที่สถานประกอบการของคุณดูแลเท่านั้น",
        },
        { status: 403 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        {
          error:
            "มีรายงานประจำสัปดาห์ในช่วงเวลานี้อยู่แล้ว กรุณาแก้ไขรายการเดิม",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะส่งรายงานประจำสัปดาห์ กรุณาลองอีกครั้งภายหลัง",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
