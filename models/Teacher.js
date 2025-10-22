import mongoose, { Schema } from "mongoose";

const TeacherSchema = new Schema(
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
    department: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

TeacherSchema.index({ user: 1 }, { unique: true, sparse: true });

const Teacher =
  mongoose.models.Teacher || mongoose.model("Teacher", TeacherSchema);

export default Teacher;
