import { Document, model, Schema } from "mongoose";

export interface ISubmission extends Document {
  assignmentId: Schema.Types.ObjectId;
  studentId: Schema.Types.ObjectId;
  answer: string;
  submittedAt: Date;
  reviewed: "pending" | "approved" | "rejected";
}

const submissionSchema = new Schema<ISubmission>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "assignments",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      required: true,
    },
    reviewed: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const SUBMISSIONSCHEMA = model<ISubmission>(
  "submissions",
  submissionSchema
);
