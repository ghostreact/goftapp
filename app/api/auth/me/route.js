import { NextResponse } from "next/server";
import { getUserFromRequest, serializeUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    const status =
      error.message === "missing_access_token" ? 401 : 500;
    const message =
      error.message === "missing_access_token"
        ? "กรุณาเข้าสู่ระบบ"
        : "ไม่สามารถตรวจสอบผู้ใช้งานได้";
    return NextResponse.json({ error: message }, { status });
  }
}
