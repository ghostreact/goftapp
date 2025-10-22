import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import {
  REFRESH_TOKEN_COOKIE,
  serializeUser,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth";

export async function POST(request) {
  try {
    const refreshToken = request.cookies
      ?.get(REFRESH_TOKEN_COOKIE)
      ?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "ไม่มีข้อมูลรีเฟรชโทเค็น" },
        { status: 401 }
      );
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload?.sub) {
      return NextResponse.json({ error: "โทเค็นไม่ถูกต้อง" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(payload.sub).populate("profile");

    if (!user || !user.active) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้งานหรือถูกปิดการใช้งาน" },
        { status: 401 }
      );
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    const response = NextResponse.json({
      message: "รีเฟรชโทเค็นเรียบร้อย",
      user: serializeUser(user),
    });

    setAuthCookies(response, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/refresh error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถรีเฟรชโทเค็นได้", details: error.message },
      { status: 401 }
    );
  }
}
