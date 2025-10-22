import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "ออกจากระบบแล้ว" });
  clearAuthCookies(response);
  return response;
}
