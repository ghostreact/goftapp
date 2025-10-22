import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
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
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student", "supervisor"],
      required: true,
    },
    profile: {
      type: Schema.Types.ObjectId,
      refPath: "profileModel",
      default: null,
    },
    profileModel: {
      type: String,
      enum: ["Admin", "Teacher", "Student", "Supervisor"],
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ role: 1 });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
