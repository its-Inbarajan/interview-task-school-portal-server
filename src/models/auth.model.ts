import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "teacher" | "student";
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name must not be empty!"],
    },
    email: {
      type: String,
      required: [true, "Email must not be empty!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password must not be empty!"],
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
    },
  },
  { timestamps: true }
);

export const USERSCHEMA = mongoose.model<IUser>("users", userSchema);
