import mongoose, { Schema } from "mongoose";

const SupervisorSchema = new Schema(
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
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

SupervisorSchema.index({ user: 1 }, { unique: true, sparse: true });
SupervisorSchema.index({ email: 1, companyName: 1 }, { unique: true });

const Supervisor =
  mongoose.models.Supervisor || mongoose.model("Supervisor", SupervisorSchema);

export default Supervisor;
