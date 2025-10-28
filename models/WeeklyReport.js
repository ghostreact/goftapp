import mongoose, { Schema } from "mongoose";

const REVIEW_STATES = ["pending", "approved", "needs_revision"];

const WeeklyReportSchema = new Schema(
  {
    internship: {
      type: Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    weekStart: {
      type: Date,
      required: true,
    },
    weekEnd: {
      type: Date,
      required: true,
    },
    workplaceSummary: {
      type: String,
      trim: true,
    },
    workplaceNotes: {
      type: String,
      trim: true,
    },
    submissionStatus: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
    },
    submittedAt: {
      type: Date,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "Workplace",
    },
    teacherReview: {
      status: {
        type: String,
        enum: REVIEW_STATES,
        default: "pending",
      },
      reviewedAt: {
        type: Date,
      },
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "Teacher",
      },
      comment: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

WeeklyReportSchema.index(
  { internship: 1, weekStart: 1 },
  { unique: true, partialFilterExpression: { weekStart: { $exists: true } } }
);

const WeeklyReport =
  mongoose.models.WeeklyReport ||
  mongoose.model("WeeklyReport", WeeklyReportSchema);

export default WeeklyReport;
export { REVIEW_STATES };
