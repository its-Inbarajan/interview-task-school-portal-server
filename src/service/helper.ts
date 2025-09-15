import { sign } from "jsonwebtoken";

export const generateToken = (userId: string, role: "teacher" | "student") => {
  return sign({ userId: userId, role: role }, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });
};
