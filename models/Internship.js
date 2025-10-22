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
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: "Supervisor",
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
      enum: ["pending", "active", "completed"],
      default: "pending",
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
  { student: 1, supervisor: 1, startDate: 1 },
  { unique: true, partialFilterExpression: { startDate: { $exists: true } } }
);

const Internship =
  mongoose.models.Internship || mongoose.model("Internship", InternshipSchema);

export default Internship;
