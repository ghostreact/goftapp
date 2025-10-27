import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import User from "@/models/User";
import Student from "@/models/Student";
import {
  authorizeRole,
  getUserFromRequest,
  hashPassword,
  serializeUser,
} from "@/lib/auth";

function validateStudentPayload(body) {
  const errors = new Set();
  if (!body.name?.trim()) errors.add("name");
  if (!body.email?.trim()) errors.add("email");
  if (!body.studentId?.trim()) errors.add("studentId");
  if (!body.password || body.password.length < 8) errors.add("password");
  if (!body.level?.trim()) errors.add("level");
  if (!body.year) errors.add("year");
  if (!body.department?.trim()) errors.add("department");
  if (!body.classroom?.trim()) errors.add("classroom");

  const validLevels = ["ปวช.", "ปวส."];
  const normalizedLevel = body.level?.trim();
  if (normalizedLevel && !validLevels.includes(normalizedLevel)) {
    errors.add("level");
  }

  if (body.year) {
    const numericYear = Number(body.year);
    if (!Number.isFinite(numericYear) || numericYear < 1 || numericYear > 3) {
      errors.add("year");
    }
  }

  return Array.from(errors);
}

export async function POST(request) {
  try {
    const teacherUser = await getUserFromRequest(request);
    authorizeRole(teacherUser, ["teacher"]);

    const teacherProfile =
      teacherUser.profileModel === "Teacher" ? teacherUser.profile : null;

    if (!teacherProfile?._id) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลครูนิเทศสำหรับบัญชีนี้" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const missing = validateStudentPayload(body);

    if (missing.length) {
      return NextResponse.json(
        {
          error: "ข้อมูลไม่ครบถ้วน",
          details: `กรุณากรอก: ${missing.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const email = body.email.trim().toLowerCase();
    const studentId = body.studentId.trim();
    const username = studentId.toLowerCase();
    const level = body.level?.trim();
    const department = body.department?.trim();
    const classroom = body.classroom?.trim();

    await connectDB();

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "อีเมลหรือรหัสนักศึกษานี้ถูกใช้งานแล้ว" },
        { status: 409 }
      );
    }

    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return NextResponse.json(
        { error: "รหัสนักศึกษาซ้ำกับข้อมูลที่มีอยู่แล้ว" },
        { status: 409 }
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const hashedPassword = await hashPassword(body.password);

      const [user] = await User.create(
        [
          {
            name: body.name,
            email,
            username,
            password: hashedPassword,
            role: "student",
            active: true,
          },
        ],
        { session }
      );

      const numericYear = Number(body.year);

      const [profile] = await Student.create(
        [
          {
            user: user._id,
            name: body.name,
            email,
            phone: body.phone || "",
            studentId,
            level,
            year: numericYear,
            department,
            classroom,
            teacher: teacherProfile._id,
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
          message: "สร้างนักศึกษาเรียบร้อยแล้ว",
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
        ? "คุณไม่มีสิทธิ์ดำเนินการ"
        : "ไม่สามารถสร้างนักศึกษาได้";

    return NextResponse.json(
      { error: message, details: error.message },
      { status }
    );
  }
}
