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
    authorizeRole(user, ["workplace"]);

    const internshipId = params.internshipId;
    if (!mongoose.Types.ObjectId.isValid(internshipId)) {
      return NextResponse.json(
        { error: "รหัสการฝึกงานไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    await connectDB();

    const internship = await Internship.findById(internshipId).populate(
      "workplace"
    );
    if (!internship) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการฝึกงานนี้" },
        { status: 404 }
      );
    }

    const workplaceId = user.profile?._id || user.profile;
    if (!workplaceId || internship.workplace?._id?.toString() !== workplaceId.toString()) {
      return NextResponse.json(
        {
          error:
            "คุณไม่มีสิทธิ์ปรับสถานะการอนุมัติสำหรับการฝึกงานรายการนี้",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const status = body.status?.trim().toLowerCase();
    if (!["pending", "accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        {
          error:
            "สถานะการอนุมัติของสถานประกอบการต้องเป็น pending, accepted หรือ rejected เท่านั้น",
        },
        { status: 400 }
      );
    }

    internship.workplaceApproval = {
      status,
      decidedAt: status === "pending" ? null : new Date(),
      decidedBy: status === "pending" ? null : workplaceId,
      note: body.note?.trim() || "",
    };

    internship.status =
      status === "accepted"
        ? "active"
        : status === "rejected"
          ? "closed"
          : "awaiting_workplace";

    await internship.save();

    return NextResponse.json({
      message: "อัปเดตสถานะการอนุมัติของสถานประกอบการเรียบร้อยแล้ว",
      workplaceApproval: internship.workplaceApproval,
    });
  } catch (error) {
    console.error(
      `PATCH /api/internships/${params.internshipId}/workplace-approval error:`,
      error
    );
    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะอัปเดตการอนุมัติของสถานประกอบการ กรุณาลองอีกครั้งภายหลัง",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
