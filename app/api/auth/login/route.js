import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import User from "@/models/User";
import Student from "@/models/Student";
import "@/models/Teacher";
import "@/models/Workplace";
import {
  comparePassword,
  serializeUser,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
} from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const rawUsername = body.username?.trim();
    const password = body.password;

    if (!rawUsername || !password) {
      return NextResponse.json(
        { error: "ต้องระบุชื่อผู้ใช้และรหัสผ่าน" },
        { status: 400 }
      );
    }

    const username = rawUsername.toLowerCase();

    await connectDB();

    let user = await User.findOne({ username }).populate("profile");

    if (!user) {
      const student = await Student.findOne({ studentId: rawUsername })
        .populate("user")
        .exec();
      if (student?.user) {
        user = await User.findById(student.user._id).populate("profile");
      }
    }

    if (!user || !user.active) {
      return NextResponse.json(
        { error: "ไม่พบบัญชีผู้ใช้หรือบัญชีถูกปิดใช้งาน" },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const response = NextResponse.json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: serializeUser(user),
    });

    setAuthCookies(response, { accessToken, refreshToken });
    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดขณะเข้าสู่ระบบ",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
