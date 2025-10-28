import { NextResponse } from "next/server";
import { getUserFromRequest, serializeUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    const status = error.message === "missing_access_token" ? 401 : 500;
    const message =
      error.message === "missing_access_token"
        ? "ไม่พบโทเค็นการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่"
        : "เกิดข้อผิดพลาดขณะโหลดข้อมูลผู้ใช้ กรุณาลองใหม่ภายหลัง";
    return NextResponse.json({ error: message }, { status });
  }
}
