import mongoose, { Schema } from "mongoose";

const ATTENDANCE_STATES = ["present", "late", "absent", "leave"];

const DailyLogSchema = new Schema(
  {
    internship: {
      type: Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    workplace: {
      type: Schema.Types.ObjectId,
      ref: "Workplace",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    attendanceStatus: {
      type: String,
      enum: ATTENDANCE_STATES,
      default: "present",
    },
    hoursWorked: {
      type: Number,
      min: 0,
      max: 24,
    },
    tasks: {
      type: String,
      required: true,
      trim: true,
    },
    behaviorReport: {
      type: String,
      trim: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    teacherAcknowledgedAt: {
      type: Date,
    },
    teacherComment: {
      type: String,
      trim: true,
    },
    teacherCommentedBy: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
    },
  },
  {
    timestamps: true,
  }
);

DailyLogSchema.index(
  { internship: 1, date: 1 },
  { unique: true, partialFilterExpression: { date: { $exists: true } } }
);
DailyLogSchema.index({ workplace: 1, date: 1 });
DailyLogSchema.index({ student: 1, date: 1 });

const DailyLog =
  mongoose.models.DailyLog || mongoose.model("DailyLog", DailyLogSchema);

export default DailyLog;
export { ATTENDANCE_STATES };
