import mongoose, { Schema } from "mongoose";

const AdminSchema = new Schema(
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
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      trim: true,
    },
    roles: {
      type: [String],
      default: ["admin"],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

AdminSchema.index({ email: 1 }, { unique: true, sparse: true });
AdminSchema.index({ username: 1 }, { unique: true, sparse: true });
AdminSchema.index({ user: 1 }, { unique: true, sparse: true });

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export default Admin;
