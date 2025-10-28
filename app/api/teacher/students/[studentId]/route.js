import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongo";
import Student, { PROGRAM_TYPES } from "@/models/Student";
import User from "@/models/User";
import {
  authorizeRole,
  getUserFromRequest,
} from "@/lib/auth";

const PROGRAM_YEAR_LIMITS = {
  vocational_certificate: { min: 1, max: 3 },
  higher_vocational_certificate: { min: 1, max: 2 },
};

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeProgramType(value) {
  if (!value) return null;
  const normalized = value.toString().trim().toLowerCase();
  if (
    [
      "vocational_certificate",
      "vocational",
      "ปวช",
      "ปวช.",
      "ป.ว.ช.",
    ].includes(normalized)
  ) {
    return "vocational_certificate";
  }
  if (
    [
      "higher_vocational_certificate",
      "higher_vocational",
      "ปวส",
      "ปวส.",
      "ป.ว.ส.",
    ].includes(normalized)
  ) {
    return "higher_vocational_certificate";
  }
  return PROGRAM_TYPES.includes(normalized) ? normalized : null;
}

function resolveStudentFilter(studentId) {
  if (!studentId) return null;
  if (mongoose.Types.ObjectId.isValid(studentId)) {
    return { _id: studentId };
  }
  return { studentId };
}

export async function PATCH(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["teacher"]);

    const teacherId =
      user.profileModel === "Teacher" ? user.profile?._id || user.profile : null;

    if (!teacherId) {
      return NextResponse.json(
        {
          error:
            "ไม่พบโปรไฟล์ครูสำหรับบัญชีนี้ กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 400 }
      );
    }

    const filter = resolveStudentFilter(params.studentId);
    if (!filter) {
      return NextResponse.json(
        { error: "รหัสนักเรียนไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const payload = await request.json();
    const updates = {};
    const errors = new Set();

    if (payload.classroom) {
      updates.classroom = payload.classroom.trim();
    }
    if (payload.department) {
      updates.department = payload.department.trim();
    }
    if (payload.phone !== undefined) {
      updates.phone = payload.phone?.trim() || "";
    }
    if (payload.status) {
      const allowedStatuses = ["active", "transferred", "graduated", "inactive"];
      if (!allowedStatuses.includes(payload.status)) {
        errors.add("status");
      } else {
        updates.status = payload.status;
      }
    }
    if (payload.birthDate) {
      const birthDate = parseDate(payload.birthDate);
      if (!birthDate) {
        errors.add("birthDate");
      } else {
        updates.birthDate = birthDate;
      }
    }
    if (payload.programType) {
      const programType = normalizeProgramType(payload.programType);
      if (!programType) {
        errors.add("programType");
      } else {
        updates.programType = programType;
        const limits = PROGRAM_YEAR_LIMITS[programType];
        if (limits && updates.yearLevel !== undefined) {
          if (
            updates.yearLevel < limits.min ||
            updates.yearLevel > limits.max
          ) {
            errors.add("yearLevel");
          }
        }
      }
    }
    if (payload.yearLevel !== undefined || payload.year !== undefined) {
      const rawYear = payload.yearLevel ?? payload.year;
      const numericYear = Number(rawYear);
      if (!Number.isFinite(numericYear)) {
        errors.add("yearLevel");
      } else {
        updates.yearLevel = numericYear;
        const programKey =
          updates.programType || payload.programType
            ? normalizeProgramType(payload.programType || updates.programType)
            : undefined;
        const limits =
          PROGRAM_YEAR_LIMITS[
            programKey ||
            (await Student.findOne(filter).select("programType").lean())
              ?.programType ||
            ""
          ];
        if (
          limits &&
          (numericYear < limits.min || numericYear > limits.max)
        ) {
          errors.add("yearLevel");
        }
      }
    }

    if (payload.notes !== undefined) {
      updates.notes = payload.notes;
    }

    if (errors.size) {
      return NextResponse.json(
        {
          error: "ข้อมูลที่ใช้แก้ไขนักเรียนไม่ถูกต้อง",
          details: `ฟิลด์ที่ไม่ถูกต้อง: ${Array.from(errors).join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        { error: "ไม่มีข้อมูลที่สามารถใช้แก้ไขได้" },
        { status: 400 }
      );
    }

    await connectDB();

    const student = await Student.findOne(filter);
    if (!student) {
      return NextResponse.json(
        { error: "ไม่พบนักเรียน" },
        { status: 404 }
      );
    }

    if (student.teacher?.toString() !== teacherId.toString()) {
      return NextResponse.json(
        {
          error:
            "คุณสามารถแก้ไขนักเรียนที่อยู่ในชั้นที่คุณรับผิดชอบเท่านั้น หากต้องการความช่วยเหลือโปรดติดต่อผู้ดูแลระบบ",
        },
        { status: 403 }
      );
    }

    Object.assign(student, updates);
    await student.save();

    return NextResponse.json({
      message: "อัปเดตโปรไฟล์นักเรียนเรียบร้อยแล้ว",
      student,
    });
  } catch (error) {
    console.error(
      `PATCH /api/teacher/students/${params.studentId} error:`,
      error
    );
    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะอัปเดตโปรไฟล์นักเรียน กรุณาลองใหม่",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["teacher"]);

    const teacherId =
      user.profileModel === "Teacher" ? user.profile?._id || user.profile : null;

    if (!teacherId) {
      return NextResponse.json(
        {
          error:
            "ไม่พบโปรไฟล์ครูสำหรับบัญชีนี้ กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 400 }
      );
    }

    const filter = resolveStudentFilter(params.studentId);
    if (!filter) {
      return NextResponse.json(
        { error: "รหัสนักเรียนไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    await connectDB();

    const student = await Student.findOne(filter).populate("user");

    if (!student) {
      return NextResponse.json(
        { error: "ไม่พบนักเรียน" },
        { status: 404 }
      );
    }

    if (student.teacher?.toString() !== teacherId.toString()) {
      return NextResponse.json(
        {
          error:
            "คุณสามารถลบนักเรียนที่อยู่ในชั้นที่คุณรับผิดชอบเท่านั้น หากต้องการความช่วยเหลือโปรดติดต่อผู้ดูแลระบบ",
        },
        { status: 403 }
      );
    }

    student.status = "inactive";
    await student.save();

    if (student.user) {
      const userDoc =
        typeof student.user.save === "function"
          ? student.user
          : await User.findById(student.user);
      if (userDoc) {
        userDoc.active = false;
        await userDoc.save();
      }
    }

    return NextResponse.json({
      message: "เปลี่ยนสถานะนักเรียนเป็นไม่ใช้งานและไม่สามารถเข้าสู่ระบบได้แล้ว",
    });
  } catch (error) {
    console.error(
      `DELETE /api/teacher/students/${params.studentId} error:`,
      error
    );
    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะลบนักเรียน กรุณาลองอีกครั้งภายหลัง",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
