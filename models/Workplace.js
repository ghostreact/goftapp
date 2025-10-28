import mongoose, { Schema } from "mongoose";

const WorkplaceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    branchName: {
      type: String,
      trim: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    contactPosition: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

WorkplaceSchema.index({ user: 1 }, { unique: true, sparse: true });
WorkplaceSchema.index(
  { companyName: 1, contactEmail: 1 },
  { unique: true, partialFilterExpression: { contactEmail: { $exists: true } } }
);

const Workplace =
  mongoose.models.Workplace || mongoose.model("Workplace", WorkplaceSchema);

export default Workplace;
