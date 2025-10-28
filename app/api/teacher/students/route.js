import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import User from "@/models/User";
import Student, { PROGRAM_TYPES } from "@/models/Student";
import {
  authorizeRole,
  getUserFromRequest,
  hashPassword,
  serializeUser,
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

function normalizeProgramType(input) {
  if (!input) return null;
  const text = input.toString().trim().toLowerCase();

  if (
    [
      "vocational_certificate",
      "vocational",
      "ปวช",
      "ปวช.",
      "ป.ว.ช.",
    ].includes(text)
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
    ].includes(text)
  ) {
    return "higher_vocational_certificate";
  }

  if (PROGRAM_TYPES.includes(text)) {
    return text;
  }

  return null;
}

function normalizeStudentPayload(body = {}) {
  const errors = new Set();

  const firstName = body.firstName?.trim();
  if (!firstName) errors.add("firstName");

  const lastName = body.lastName?.trim();
  if (!lastName) errors.add("lastName");

  const birthDate = parseDate(body.birthDate);
  if (!birthDate) errors.add("birthDate");

  const rawEmail = body.email?.trim();
  const email = rawEmail ? rawEmail.toLowerCase() : null;

  const studentId = body.studentId?.trim();
  if (!studentId) errors.add("studentId");

  const programType = normalizeProgramType(body.programType || body.level);
  if (!programType) errors.add("programType");

  const yearLevelRaw = body.yearLevel ?? body.year;
  const yearLevel = yearLevelRaw !== undefined ? Number(yearLevelRaw) : NaN;

  if (!Number.isFinite(yearLevel)) {
    errors.add("yearLevel");
  } else if (programType) {
    const { min, max } = PROGRAM_YEAR_LIMITS[programType] || {};
    if ((min && yearLevel < min) || (max && yearLevel > max)) {
      errors.add("yearLevel");
    }
  }

  const department = body.department?.trim();
  if (!department) errors.add("department");

  const classroom = body.classroom?.trim();
  if (!classroom) errors.add("classroom");

  const phone = body.phone?.trim() || "";
  const status = body.status === "inactive" ? "inactive" : "active";
  const password = body.password;
  if (!password || password.length < 8) {
    errors.add("password");
  }

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
      password,
    },
  };
}

export async function POST(request) {
  try {
    const teacherUser = await getUserFromRequest(request);
    authorizeRole(teacherUser, ["teacher"]);

    const teacherProfile =
      teacherUser.profileModel === "Teacher" ? teacherUser.profile : null;

    if (!teacherProfile?._id) {
      return NextResponse.json(
        {
          error:
            "ไม่พบโปรไฟล์ครูสำหรับบัญชีนี้ กรุณาติดต่อผู้ดูแลระบบ",
        },
        { status: 400 }
      );
    }

    const payload = await request.json();
    const { errors, data } = normalizeStudentPayload(payload);

    if (errors.length) {
      return NextResponse.json(
        {
          error: "ข้อมูลลงทะเบียนนักเรียนไม่ครบถ้วนหรือไม่ถูกต้อง",
          details: `ฟิลด์ที่ขาดหรือไม่ถูกต้อง: ${errors.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const username = data.studentId.toLowerCase();

    await connectDB();

    const existingUser = await User.findOne({
      $or: [
        { username },
        ...(data.email ? [{ email: data.email }] : []),
      ],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "มีผู้ใช้งานที่ใช้รหัสนักศึกษาหรืออีเมลนี้อยู่แล้ว กรุณาตรวจสอบข้อมูลอีกครั้ง",
        },
        { status: 409 }
      );
    }

    const existingStudent = await Student.findOne({
      studentId: data.studentId,
    });

    if (existingStudent) {
      return NextResponse.json(
        {
          error:
            "รหัสนักศึกษานี้ถูกใช้กับโปรไฟล์นักเรียนอื่นแล้ว",
        },
        { status: 409 }
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const hashedPassword = await hashPassword(data.password);

      const [user] = await User.create(
        [
          {
            name: data.fullName,
            email: data.email,
            username,
            password: hashedPassword,
            role: "student",
            active: true,
          },
        ],
        { session }
      );

      const [profile] = await Student.create(
        [
          {
            user: user._id,
            firstName: data.firstName,
            lastName: data.lastName,
            fullName: data.fullName,
            name: data.fullName,
            birthDate: data.birthDate,
            email: data.email,
            phone: data.phone,
            studentId: data.studentId,
            programType: data.programType,
            yearLevel: data.yearLevel,
            department: data.department,
            classroom: data.classroom,
            teacher: teacherProfile._id,
            status: data.status,
          },
        ],
        { session }
      );

      user.profile = profile._id;
      user.profileModel = "Student";
      await user.save({ session });

      await session.commitTransaction();

      return NextResponse.json(
        {
          message: "สร้างบัญชีนักเรียนเรียบร้อยแล้ว",
          user: serializeUser(user),
        },
        { status: 201 }
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("POST /api/teacher/students error:", error);
    const status = ["unauthorized", "forbidden"].includes(error.message)
      ? 401
      : 500;
    const message =
      ["unauthorized", "forbidden"].includes(error.message)
        ? "คุณไม่มีสิทธิ์จัดการนักเรียนด้วยบัญชีนี้"
        : "เกิดข้อผิดพลาดขณะสร้างบัญชีนักเรียน กรุณาลองใหม่";

    return NextResponse.json(
      { error: message, details: error.message },
      { status }
    );
  }
}
