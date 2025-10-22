import mongoose, { Schema } from "mongoose";

const StudentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
    },
    faculty: {
      type: String,
      trim: true,
    },
    major: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
      min: 1,
      max: 8,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
    },
  },
  {
    timestamps: true,
  }
);

StudentSchema.index({ user: 1 }, { unique: true, sparse: true });

const Student =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);

export default Student;
