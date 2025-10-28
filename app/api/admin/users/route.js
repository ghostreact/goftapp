import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import Workplace from "@/models/Workplace";
import {
  authorizeRole,
  getUserFromRequest,
  hashPassword,
  serializeUser,
} from "@/lib/auth";

const ADMIN_ALLOWED_ROLES = ["teacher", "workplace"];

function validateAdminPayload(body = {}) {
  const errors = [];

  if (!body.role || !ADMIN_ALLOWED_ROLES.includes(body.role)) {
    errors.push("role");
  }

  if (!body.name?.trim()) {
    errors.push("name");
  }

  if (!body.username?.trim()) {
    errors.push("username");
  }

  if (!body.email?.trim()) {
    errors.push("email");
  }

  if (!body.password || body.password.length < 8) {
    errors.push("password");
  }

  if (body.role === "teacher" && !body.department?.trim()) {
    errors.push("department");
  }

  if (body.role === "workplace") {
    if (!body.companyName?.trim()) {
      errors.push("companyName");
    }
    if (!body.contactName?.trim()) {
      errors.push("contactName");
    }
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
          error: "ข้อมูลสำหรับสร้างบัญชีไม่ครบถ้วนหรือไม่ถูกต้อง",
          details: `ฟิลด์ที่ขาดหรือไม่ถูกต้อง: ${errors.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const email = body.email.trim().toLowerCase();
    const username = body.username.trim().toLowerCase();

    await connectDB();

    const duplicate = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "มีผู้ใช้งานที่ใช้อีเมลหรือชื่อผู้ใช้นี้อยู่แล้ว กรุณาเลือกข้อมูลอื่น",
        },
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
      } else if (body.role === "workplace") {
        const [workplace] = await Workplace.create(
          [
            {
              user: user._id,
              companyName: body.companyName.trim(),
              branchName: body.branchName || "",
              contactName: body.contactName?.trim() || body.name,
              contactEmail: email,
              contactPhone: body.phone || "",
              contactPosition: body.contactPosition || body.position || "",
              address: body.address || "",
              status: body.workplaceStatus || "pending",
              notes: body.notes || "",
            },
          ],
          { session }
        );
        profileDoc = workplace;
      }

      user.profile = profileDoc?._id || null;
      user.profileModel =
        body.role === "teacher"
          ? "Teacher"
          : body.role === "workplace"
            ? "Workplace"
            : null;
      await user.save({ session });

      await session.commitTransaction();

      return NextResponse.json(
        {
          message: "สร้างบัญชีผู้ใช้เรียบร้อยแล้ว",
          user: serializeUser(user),
        },
        { status: 201 }
      );
    } catch (error) {
      if (session.inTransaction()) {
        try {
          await session.abortTransaction();
        } catch (abortError) {
          console.error(
            "POST /api/admin/users abortTransaction failed:",
            abortError
          );
        }
      }
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    const status = error.message === "unauthorized" ? 401 : 500;
    const message =
      error.message === "unauthorized"
        ? "คุณไม่มีสิทธิ์สร้างบัญชีผู้ใช้"
        : "เกิดข้อผิดพลาดขณะสร้างบัญชีผู้ใช้ กรุณาลองใหม่";

    return NextResponse.json(
      { error: message, details: error.message },
      { status }
    );
  }
}
