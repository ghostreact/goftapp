import mongoose, { Schema } from "mongoose";

const InternshipSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    workplace: {
      type: Schema.Types.ObjectId,
      ref: "Workplace",
      required: true,
    },
    projectTitle: {
      type: String,
      trim: true,
    },
    objectives: {
      type: String,
      trim: true,
    },
    responsibilities: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    weeklyHours: {
      type: Number,
      min: 0,
      max: 168,
    },
    status: {
      type: String,
      enum: ["pending", "awaiting_workplace", "active", "completed", "closed"],
      default: "pending",
    },
    workplaceApproval: {
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      decidedAt: {
        type: Date,
      },
      decidedBy: {
        type: Schema.Types.ObjectId,
        ref: "Workplace",
      },
      note: {
        type: String,
        trim: true,
      },
    },
    weeklyApprovals: [
      new Schema(
        {
          weekStart: {
            type: Date,
            required: true,
          },
          weekEnd: {
            type: Date,
            required: true,
          },
          status: {
            type: String,
            enum: ["pending", "approved", "needs_revision"],
            default: "pending",
          },
          summary: {
            type: String,
            trim: true,
          },
          teacherComment: {
            type: String,
            trim: true,
          },
          approvedAt: {
            type: Date,
          },
          approvedBy: {
            type: Schema.Types.ObjectId,
            ref: "Teacher",
          },
        },
        { _id: false }
      ),
    ],
    finalAssessment: {
      status: {
        type: String,
        enum: ["pending", "passed", "failed"],
        default: "pending",
      },
      decidedAt: {
        type: Date,
      },
      decidedBy: {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
      },
      comment: {
        type: String,
        trim: true,
      },
    },
    metrics: {
      totalLogs: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalApprovedWeeks: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    focusAreas: [
      {
        type: String,
        trim: true,
      },
    ],
    deliverables: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

InternshipSchema.index(
  { student: 1, workplace: 1, startDate: 1 },
  { unique: true, partialFilterExpression: { startDate: { $exists: true } } }
);

const Internship =
  mongoose.models.Internship || mongoose.model("Internship", InternshipSchema);

export default Internship;
