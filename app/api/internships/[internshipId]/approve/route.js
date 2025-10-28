import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongo";
import Internship from "@/models/Internship";
import {
  authorizeRole,
  getUserFromRequest,
} from "@/lib/auth";

export async function PATCH(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["teacher"]);

    const internshipId = params.internshipId;
    if (!mongoose.Types.ObjectId.isValid(internshipId)) {
      return NextResponse.json(
        { error: "รหัสการฝึกงานไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    await connectDB();

    const internship = await Internship.findById(internshipId).populate(
      "teacher"
    );
    if (!internship) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการฝึกงานนี้" },
        { status: 404 }
      );
    }

    const teacherId = user.profile?._id || user.profile;
    if (!teacherId || internship.teacher?._id?.toString() !== teacherId.toString()) {
      return NextResponse.json(
        {
          error:
            "คุณไม่มีสิทธิ์สรุปผลการฝึกงานรายการนี้",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const decision = body.status?.trim().toLowerCase();
    if (!["passed", "failed", "pending"].includes(decision)) {
      return NextResponse.json(
        {
          error: "สถานะสรุปต้องเป็น passed, failed หรือ pending เท่านั้น",
        },
        { status: 400 }
      );
    }

    internship.finalAssessment = {
      status: decision,
      decidedAt: decision === "pending" ? null : new Date(),
      decidedBy: decision === "pending" ? null : teacherId,
      comment: body.comment?.trim() || "",
    };

    internship.status =
      decision === "passed" ? "completed" : decision === "failed" ? "closed" : internship.status;

    await internship.save();

    return NextResponse.json({
      message: "บันทึกผลการประเมินสรุปการฝึกงานเรียบร้อยแล้ว",
      finalAssessment: internship.finalAssessment,
    });
  } catch (error) {
    console.error(
      `PATCH /api/internships/${params.internshipId}/approve error:`,
      error
    );
    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะบันทึกผลการฝึกงาน กรุณาลองอีกครั้งภายหลัง",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
