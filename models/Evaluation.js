import mongoose, { Schema } from "mongoose";

const EvaluationSchema = new Schema(
  {
    internship: {
      type: Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    evaluatorRole: {
      type: String,
      enum: ["teacher", "supervisor"],
      required: true,
    },
    evaluatorName: {
      type: String,
      required: true,
      trim: true,
    },
    evaluatorEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    evaluatorPosition: {
      type: String,
      trim: true,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    scores: {
      technical: {
        type: Number,
        min: 0,
        max: 5,
      },
      communication: {
        type: Number,
        min: 0,
        max: 5,
      },
      problemSolving: {
        type: Number,
        min: 0,
        max: 5,
      },
      professionalism: {
        type: Number,
        min: 0,
        max: 5,
      },
    },
    strengths: {
      type: String,
      trim: true,
    },
    improvements: {
      type: String,
      trim: true,
    },
    comments: {
      type: String,
      trim: true,
    },
    recommendation: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

EvaluationSchema.index({ internship: 1, evaluatorRole: 1, createdAt: -1 });

const Evaluation =
  mongoose.models.Evaluation || mongoose.model("Evaluation", EvaluationSchema);

export default Evaluation;
