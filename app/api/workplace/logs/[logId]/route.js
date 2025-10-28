import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongo";
import DailyLog, { ATTENDANCE_STATES } from "@/models/DailyLog";
import {
  authorizeRole,
  getUserFromRequest,
} from "@/lib/auth";

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function PATCH(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["workplace", "teacher"]);

    const logId = params.logId;
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      return NextResponse.json(
        { error: "รหัสบันทึกไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates = {};
    const errors = new Set();

    if (user.role === "workplace") {
      if (body.date) {
        const normalized = parseDate(body.date);
        if (!normalized) {
          errors.add("date");
        } else {
          normalized.setHours(0, 0, 0, 0);
          updates.date = normalized;
        }
      }

      if (body.tasks !== undefined) {
        updates.tasks = body.tasks?.trim() || "";
      }

      if (body.behaviorReport !== undefined) {
        updates.behaviorReport = body.behaviorReport?.trim() || "";
      }

      if (body.attendanceStatus) {
        const status = body.attendanceStatus.trim().toLowerCase();
        if (!ATTENDANCE_STATES.includes(status)) {
          errors.add("attendanceStatus");
        } else {
          updates.attendanceStatus = status;
        }
      }

      if (body.hoursWorked !== undefined) {
        const value = Number(body.hoursWorked);
        if (!Number.isFinite(value) || value < 0 || value > 24) {
          errors.add("hoursWorked");
        } else {
          updates.hoursWorked = value;
        }
      }
    }

    if (user.role === "teacher") {
      if (body.teacherComment !== undefined) {
        updates.teacherComment = body.teacherComment?.trim() || "";
        updates.teacherCommentedAt = new Date();
        updates.teacherCommentedBy = user.profile?._id || user.profile;
      }

      if (body.acknowledged === true) {
        updates.teacherAcknowledgedAt = new Date();
      } else if (body.acknowledged === false) {
        updates.teacherAcknowledgedAt = null;
      }
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        { error: "ไม่มีข้อมูลที่สามารถใช้แก้ไขได้" },
        { status: 400 }
      );
    }

    if (errors.size) {
      return NextResponse.json(
        {
          error: "การอัปเดตบันทึกมีฟิลด์ไม่ถูกต้อง",
          details: `ฟิลด์ที่ไม่ถูกต้อง: ${Array.from(errors).join(", ")}`,
        },
        { status: 400 }
      );
    }

    await connectDB();

    const log = await DailyLog.findById(logId).populate("workplace");
    if (!log) {
      return NextResponse.json(
        { error: "ไม่พบบันทึก" },
        { status: 404 }
      );
    }

    if (user.role === "workplace") {
      const workplaceId = user.profile?._id || user.profile;
      if (log.workplace?._id?.toString() !== workplaceId.toString()) {
        return NextResponse.json(
          {
            error:
              "คุณสามารถแก้ไขบันทึกที่เป็นของสถานประกอบการของคุณเท่านั้น",
          },
          { status: 403 }
        );
      }
    }

    Object.assign(log, updates);
    await log.save();

    return NextResponse.json({
      message: "อัปเดตบันทึกเรียบร้อยแล้ว",
      log,
    });
  } catch (error) {
    console.error(`PATCH /api/workplace/logs/${params.logId} error:`, error);
    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะอัปเดตบันทึกฝึกงาน กรุณาลองอีกครั้งในภายหลัง",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["workplace"]);

    const logId = params.logId;
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      return NextResponse.json(
        { error: "รหัสบันทึกไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    await connectDB();

    const log = await DailyLog.findById(logId).populate("workplace");
    if (!log) {
      return NextResponse.json(
        { error: "ไม่พบบันทึก" },
        { status: 404 }
      );
    }

    const workplaceId = user.profile?._id || user.profile;
    if (log.workplace?._id?.toString() !== workplaceId.toString()) {
      return NextResponse.json(
        {
          error:
            "คุณสามารถลบบันทึกที่เป็นของสถานประกอบการของคุณเท่านั้น",
        },
        { status: 403 }
      );
    }

    await log.deleteOne();
    await Internship.findByIdAndUpdate(log.internship, {
      $inc: { "metrics.totalLogs": -1 },
    });

    return NextResponse.json({
      message: "ลบบันทึกเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error(`DELETE /api/workplace/logs/${params.logId} error:`, error);
    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะลบบันทึกฝึกงาน กรุณาลองอีกครั้งในภายหลัง",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
