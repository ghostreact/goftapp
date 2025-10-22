import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Evaluation from "@/models/Evaluation";
import Internship from "@/models/Internship";
import {
  authorizeRole,
  getUserFromRequest,
  serializeUser,
} from "@/lib/auth";

function buildEvaluationFilter(user, internshipId, evaluatorRole) {
  const filter = {};
  if (internshipId) {
    filter.internship = internshipId;
  }
  if (evaluatorRole) {
    filter.evaluatorRole = evaluatorRole;
  }

  if (user.role === "teacher") {
    const teacherId = user.profile?._id || user.profile;
    if (!teacherId) {
      throw new Error("missing_teacher_profile");
    }
    filter["internship.teacher"] = teacherId;
  } else if (user.role === "supervisor") {
    const supervisorId = user.profile?._id || user.profile;
    if (!supervisorId) {
      throw new Error("missing_supervisor_profile");
    }
    filter["internship.supervisor"] = supervisorId;
  } else if (user.role === "student") {
    const studentId = user.profile?._id || user.profile;
    if (!studentId) {
      throw new Error("missing_student_profile");
    }
    filter["internship.student"] = studentId;
  }

  return filter;
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["admin", "teacher", "supervisor", "student"]);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const internshipId = searchParams.get("internshipId");
    const evaluatorRole = searchParams.get("role");

    let filter = {};
    try {
      filter = buildEvaluationFilter(user, internshipId, evaluatorRole);
    } catch (error) {
      const messages = {
        missing_teacher_profile: "ไม่พบข้อมูลครูนิเทศสำหรับบัญชีนี้",
        missing_supervisor_profile: "ไม่พบข้อมูลผู้ควบคุมสำหรับบัญชีนี้",
        missing_student_profile: "ไม่พบนักศึกษาที่เชื่อมกับบัญชีนี้",
      };
      return NextResponse.json(
        { error: messages[error.message] || "ไม่พบข้อมูลผู้ใช้ที่เชื่อมโยง" },
        { status: 400 }
      );
    }

    const evaluations = await Evaluation.find(filter)
      .populate({
        path: "internship",
        populate: ["student", "teacher", "supervisor"],
      })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = evaluations.map((item) => ({
      ...item,
      _id: item._id.toString(),
      internship: item.internship
        ? {
            ...item.internship,
            _id: item.internship._id?.toString(),
          }
        : null,
    }));

    return NextResponse.json({ data: formatted });
  } catch (error) {
    console.error("GET /api/evaluations error:", error);
    return NextResponse.json(
      {
        error: "ไม่สามารถดึงข้อมูลการประเมินได้",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["admin", "teacher", "supervisor"]);

    await connectDB();

    const data = await request.json();

    if (!data.internshipId) {
      return NextResponse.json(
        { error: "กรุณาระบุรหัสรายการฝึกงาน" },
        { status: 400 }
      );
    }

    if (!data.evaluatorName || !data.evaluatorEmail) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อและอีเมลของผู้ประเมิน" },
        { status: 400 }
      );
    }

    const internship = await Internship.findById(data.internshipId)
      .populate("student")
      .populate("teacher")
      .populate("supervisor");

    if (!internship) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการฝึกงาน" },
        { status: 404 }
      );
    }

    if (user.role === "teacher") {
      const teacherId = user.profile?._id || user.profile;
      if (!teacherId || internship.teacher?._id?.toString() !== teacherId.toString()) {
        return NextResponse.json(
          { error: "คุณไม่มีสิทธิ์ประเมินรายการฝึกงานนี้" },
          { status: 403 }
        );
      }
    }

    if (user.role === "supervisor") {
      const supervisorId = user.profile?._id || user.profile;
      if (
        !supervisorId ||
        internship.supervisor?._id?.toString() !== supervisorId.toString()
      ) {
        return NextResponse.json(
          { error: "คุณไม่มีสิทธิ์ประเมินรายการฝึกงานนี้" },
          { status: 403 }
        );
      }
    }

    const toNumeric = (value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : undefined;
    };

    const evaluation = await Evaluation.create({
      internship: internship._id,
      evaluatorRole: data.evaluatorRole || user.role || "supervisor",
      evaluatorName: data.evaluatorName,
      evaluatorEmail: data.evaluatorEmail,
      evaluatorPosition: data.evaluatorPosition,
      overallScore: toNumeric(data.overallScore),
      scores: {
        technical: toNumeric(data.scores?.technical),
        professionalism: toNumeric(data.scores?.professionalism),
        communication: toNumeric(data.scores?.communication),
        problemSolving: toNumeric(data.scores?.problemSolving),
      },
      strengths: data.strengths,
      improvements: data.improvements,
      comments: data.comments,
      recommendation: data.recommendation,
    });

    if (data.status) {
      await Internship.findByIdAndUpdate(internship._id, {
        status: data.status,
      });
    }

    const populated = await evaluation.populate({
      path: "internship",
      populate: ["student", "teacher", "supervisor"],
    });

    return NextResponse.json(
      {
        message: "บันทึกการประเมินเรียบร้อยแล้ว",
        data: {
          ...populated.toObject(),
          _id: populated._id.toString(),
          evaluator: serializeUser(user),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/evaluations error:", error);
    const status =
      error.message === "unauthorized" || error.message === "forbidden"
        ? 401
        : 500;
    const message =
      error.message === "unauthorized" || error.message === "forbidden"
        ? "คุณไม่มีสิทธิ์บันทึกการประเมิน"
        : "ไม่สามารถบันทึกข้อมูลการประเมินได้";

    return NextResponse.json(
      { error: message, details: error.message },
      { status }
    );
  }
}
