import mongoose, { Schema } from "mongoose";

export const PROGRAM_TYPES = [
  "vocational_certificate",
  "higher_vocational_certificate",
];

const StudentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
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
    programType: {
      type: String,
      enum: PROGRAM_TYPES,
      required: true,
      trim: true,
    },
    yearLevel: {
      type: Number,
      min: 1,
      required: true,
      validate: {
        validator(value) {
          if (this.programType === "vocational_certificate") {
            return value >= 1 && value <= 3;
          }
          if (this.programType === "higher_vocational_certificate") {
            return value >= 1 && value <= 2;
          }
          return false;
        },
        message() {
          if (this.programType === "vocational_certificate") {
            return "Year level for vocational certificate students must be between 1 and 3.";
          }
          if (this.programType === "higher_vocational_certificate") {
            return "Year level for higher vocational certificate students must be between 1 and 2.";
          }
          return "Unknown programme type. Please select a valid programme.";
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
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "transferred", "graduated", "inactive"],
      default: "active",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

StudentSchema.index({ user: 1 }, { unique: true, sparse: true });
StudentSchema.index({ teacher: 1, programType: 1, yearLevel: 1 });

StudentSchema.pre("validate", function preValidate(next) {
  if (this.firstName || this.lastName) {
    this.fullName = [this.firstName, this.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  if (!this.fullName) {
    this.invalidate(
      "fullName",
      "Full name is required. Please provide both first and last names."
    );
  } else {
    this.name = this.fullName;
  }

  next();
});

StudentSchema.virtual("age").get(function getAge() {
  if (!this.birthDate) return null;

  const now = new Date();
  const birth = new Date(this.birthDate);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
});

const Student =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);

export default Student;
