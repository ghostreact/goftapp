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
    level: {
      type: String,
      enum: ["ปวช.", "ปวส."],
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      min: 1,
      required: true,
      validate: {
        validator(value) {
          if (this.level === "ปวช.") {
            return value >= 1 && value <= 3;
          }
          if (this.level === "ปวส.") {
            return value >= 1 && value <= 2;
          }
          return false;
        },
        message() {
          if (this.level === "ปวช.") {
            return "ชั้นปีของ ปวช. ต้องอยู่ระหว่าง 1-3";
          }
          if (this.level === "ปวส.") {
            return "ชั้นปีของ ปวส. ต้องอยู่ระหว่าง 1-2";
          }
          return "ระดับและชั้นปีไม่สอดคล้องกัน";
        },
      },
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    classroom: {
      type: String,
      required: true,
      trim: true,
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
