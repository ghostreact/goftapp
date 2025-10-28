import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Evaluation from "@/models/Evaluation";
import Internship from "@/models/Internship";
import {
  authorizeRole,
  getUserFromRequest,
} from "@/lib/auth";

function buildQuery(searchParams) {
  const filter = {};
  const internshipId = searchParams.get("internshipId");
  if (internshipId) {
    filter.internship = internshipId;
  }
  const evaluatorRole = searchParams.get("role");
  if (evaluatorRole) {
    filter.evaluatorRole = evaluatorRole;
  }
  return filter;
}

function canAccessEvaluation(user, evaluation) {
  if (user.role === "admin") return true;

  const internship = evaluation.internship;
  const teacherId = user.profileModel === "Teacher" ? user.profile?._id || user.profile : null;
  const workplaceId = user.profileModel === "Workplace" ? user.profile?._id || user.profile : null;
  const studentId = user.profileModel === "Student" ? user.profile?._id || user.profile : null;

  if (user.role === "teacher") {
    return teacherId && internship.teacher?._id?.toString() === teacherId.toString();
  }

  if (user.role === "workplace") {
    return workplaceId && internship.workplace?._id?.toString() === workplaceId.toString();
  }

  if (user.role === "student") {
    return studentId && internship.student?._id?.toString() === studentId.toString();
  }

  return false;
}

function toNumberOrUndefined(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["admin", "teacher", "workplace", "student"]);

    await connectDB();

    const filter = buildQuery(new URL(request.url).searchParams);

    const evaluations = await Evaluation.find(filter)
      .populate({
        path: "internship",
        populate: ["student", "teacher", "workplace"],
      })
      .sort({ createdAt: -1 })
      .lean();

    const accessible = evaluations.filter((item) =>
      canAccessEvaluation(user, item)
    );

    const data = accessible.map((item) => ({
      ...item,
      _id: item._id.toString(),
      internship: item.internship
        ? {
            ...item.internship,
            _id: item.internship._id?.toString(),
          }
        : null,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/evaluations error:", error);
    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะโหลดข้อมูลการประเมิน กรุณาลองอีกครั้งภายหลัง",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    authorizeRole(user, ["admin", "teacher", "workplace"]);

    await connectDB();

    const payload = await request.json();

    if (!payload.internshipId) {
      return NextResponse.json(
        { error: "ต้องระบุรหัสการฝึกงาน" },
        { status: 400 }
      );
    }

    if (!payload.evaluatorName?.trim() || !payload.evaluatorEmail?.trim()) {
      return NextResponse.json(
        {
          error: "กรุณาระบุชื่อและอีเมลของผู้ประเมินก่อนส่งผลประเมิน",
        },
        { status: 400 }
      );
    }

    const internship = await Internship.findById(payload.internshipId)
      .populate("student")
      .populate("teacher")
      .populate("workplace");

    if (!internship) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการฝึกงานนี้" },
        { status: 404 }
      );
    }

    if (user.role === "teacher") {
      const teacherId = user.profile?._id || user.profile;
      if (!teacherId || internship.teacher?._id?.toString() !== teacherId.toString()) {
        return NextResponse.json(
          {
            error:
              "คุณสามารถส่งผลประเมินเฉพาะนักเรียนในชั้นที่คุณรับผิดชอบเท่านั้น",
          },
          { status: 403 }
        );
      }
    }

    if (user.role === "workplace") {
      const workplaceId = user.profile?._id || user.profile;
      if (!workplaceId || internship.workplace?._id?.toString() !== workplaceId.toString()) {
        return NextResponse.json(
          {
            error:
              "คุณสามารถส่งผลประเมินเฉพาะการฝึกงานที่สถานประกอบการของคุณดูแลเท่านั้น",
          },
          { status: 403 }
        );
      }
    }

    const evaluation = await Evaluation.create({
      internship: internship._id,
      evaluatorRole: payload.evaluatorRole || user.role || "workplace",
      evaluatorName: payload.evaluatorName,
      evaluatorEmail: payload.evaluatorEmail.toLowerCase(),
      evaluatorPosition: payload.evaluatorPosition,
      overallScore: toNumberOrUndefined(payload.overallScore),
      scores: {
        technical: toNumberOrUndefined(payload.scores?.technical),
        professionalism: toNumberOrUndefined(payload.scores?.professionalism),
        communication: toNumberOrUndefined(payload.scores?.communication),
        problemSolving: toNumberOrUndefined(payload.scores?.problemSolving),
      },
      strengths: payload.strengths,
      improvements: payload.improvements,
      comments: payload.comments,
      recommendation: payload.recommendation,
    });

    if (payload.status) {
      await Internship.findByIdAndUpdate(internship._id, {
        status: payload.status,
      });
    }

    const populated = await evaluation.populate({
      path: "internship",
      populate: ["student", "teacher", "workplace"],
    });

    return NextResponse.json(
      {
        message: "ส่งแบบประเมินเรียบร้อยแล้ว",
        data: {
          ...populated.toObject(),
          _id: populated._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/evaluations error:", error);

    if (error.message === "unauthorized" || error.message === "forbidden") {
      return NextResponse.json(
        {
          error:
            "คุณไม่มีสิทธิ์ส่งผลประเมินสำหรับการฝึกงานรายการนี้",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดขณะส่งผลประเมิน กรุณาลองอีกครั้งภายหลัง",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
