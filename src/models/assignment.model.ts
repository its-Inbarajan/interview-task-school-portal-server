import { Document, model, Schema, Types } from "mongoose";
import { IUser } from "./auth.model";

export interface IAssignment extends Document {
  title: string;
  description: string;
  dueDate: Date;
  status: "draft" | "pubished" | "completed";
  createdBy: Types.ObjectId | IUser;
}

const AssignMentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "pubished", "completed"],
      default: "draft",
    },
    createdBy: {
      ref: "users",
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

export const ASSIGNMENT = model<IAssignment>("assignments", AssignMentSchema);
