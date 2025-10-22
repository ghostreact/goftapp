import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import Supervisor from "@/models/Supervisor";
import {
  authorizeRole,
  getUserFromRequest,
  hashPassword,
  serializeUser,
} from "@/lib/auth";

function validateAdminPayload(body) {
  const errors = [];
  if (!body.role || !["teacher", "supervisor"].includes(body.role)) {
    errors.push("role");
  }
  if (!body.name) {
    errors.push("name");
  }
  if (!body.username) {
    errors.push("username");
  }
  if (!body.email) {
    errors.push("email");
  }
  if (!body.password || body.password.length < 8) {
    errors.push("password");
  }

  return errors;
}

export async function POST(request) {
  try {
    const adminUser = await getUserFromRequest(request);
    authorizeRole(adminUser, ["admin"]);

    const body = await request.json();
    const errors = validateAdminPayload(body);

    if (errors.length) {
      return NextResponse.json(
        {
          error: "ข้อมูลไม่ครบถ้วน",
          details: `กรุณากรอก: ${errors.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const email = body.email.trim().toLowerCase();
    const username = body.username.trim().toLowerCase();

    await connectDB();

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว" },
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
            role: body.role,
            active: true,
          },
        ],
        { session }
      );

      let profileDoc = null;

      if (body.role === "teacher") {
        const [teacher] = await Teacher.create(
          [
            {
              user: user._id,
              name: body.name,
              email,
              phone: body.phone || "",
              department: body.department || "",
            },
          ],
          { session }
        );
        profileDoc = teacher;
      } else if (body.role === "supervisor") {
        const [supervisor] = await Supervisor.create(
          [
            {
              user: user._id,
              name: body.name,
              email,
              phone: body.phone || "",
              position: body.position || "",
              companyName: body.companyName || "",
            },
          ],
          { session }
        );
        profileDoc = supervisor;
      }

      user.profile = profileDoc?._id || null;
      user.profileModel =
        body.role === "teacher"
          ? "Teacher"
          : body.role === "supervisor"
            ? "Supervisor"
            : null;
      await user.save({ session });

      await session.commitTransaction();

      return NextResponse.json(
        {
          message: "สร้างผู้ใช้งานใหม่สำเร็จ",
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
    console.error("POST /api/admin/users error:", error);
    const status = error.message === "unauthorized" ? 401 : 500;
    const message =
      error.message === "unauthorized"
        ? "คุณไม่มีสิทธิ์เข้าถึง"
        : "ไม่สามารถสร้างผู้ใช้งานได้";
    return NextResponse.json(
      { error: message, details: error.message },
      { status }
    );
  }
}
