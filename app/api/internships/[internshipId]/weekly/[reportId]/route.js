import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongo";
import Internship from "@/models/Internship";
import WeeklyReport from "@/models/WeeklyReport";
import {
  authorizeRole,
  getUserFromRequest,
} from "@/lib/auth";

async function loadContext(internshipId, reportId, user) {
  if (!mongoose.Types.ObjectId.isValid(internshipId)) {
    throw new Error("invalid_internship_id");
  }

  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new Error("invalid_report_id");
  }

  await connectDB();

  const internship = await Internship.findById(internshipId).populate(
    "teacher"
  );
  if (!internship) {
    throw new Error("internship_not_found");
  }

  if (user.role !== "teacher") {
    throw new Error("forbidden");
  }

  const teacherId = user.profile?._id || user.profile;
  if (!teacherId || internship.teacher?._id?.toString() !== teacherId.toString()) {
    throw new Error("forbidden");
  }

  const report = await WeeklyReport.findOne({
    _id: reportId,
    internship: internship._id,
  });

  if (!report) {
    throw new Error("report_not_found");
  }

  return { internship, report, teacherId };
}

export async function PATCH(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["teacher"]);

    const { internship, report, teacherId } = await loadContext(
      params.internshipId,
      params.reportId,
      user
    );

    const body = await request.json();
    const status = body.status?.trim().toLowerCase();
    const comment = body.comment?.trim() || "";

    if (!["approved", "needs_revision", "pending"].includes(status)) {
      return NextResponse.json(
        {
          error:
            "สถานะการตรวจของครูต้องเป็น approved, needs_revision หรือ pending เท่านั้น",
        },
        { status: 400 }
      );
    }

    report.teacherReview = {
      status,
      reviewedAt: new Date(),
      reviewedBy: teacherId,
      comment,
    };

    await report.save();

    if (status === "approved") {
      await Internship.findByIdAndUpdate(internship._id, {
        $inc: { "metrics.totalApprovedWeeks": 1 },
      });
    }

    return NextResponse.json({
      message: "อัปเดตผลการตรวจรายงานประจำสัปดาห์เรียบร้อยแล้ว",
      report,
    });
  } catch (error) {
    console.error(
      `PATCH /api/internships/${params.internshipId}/weekly/${params.reportId} error:`,
      error
    );

    if (error.message === "internship_not_found") {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการฝึกงานนี้" },
        { status: 404 }
      );
    }

    if (error.message === "report_not_found") {
      return NextResponse.json(
        { error: "ไม่พบรายงานประจำสัปดาห์" },
        { status: 404 }
      );
    }

    if (
      error.message === "invalid_internship_id" ||
      error.message === "invalid_report_id"
    ) {
      return NextResponse.json(
        { error: "รหัสอ้างอิงไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (error.message === "forbidden") {
      return NextResponse.json(
        {
          error:
            "คุณไม่มีสิทธิ์ตรวจรายงานประจำสัปดาห์ของการฝึกงานรายการนี้",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะอัปเดตผลการตรวจรายงานประจำสัปดาห์ กรุณาลองอีกครั้งภายหลัง",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
