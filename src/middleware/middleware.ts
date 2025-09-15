import { NextFunction, Request, Response } from "express";
import { CustomError } from "./global-error";
import { JwtPayload, verify } from "jsonwebtoken";
import { IUser } from "../models/auth.model";

interface TokenPayLoad extends JwtPayload {
  userId?: string;
  role: "teacher" | "student";
}

interface CustomRequest extends Request {
  user?: Pick<IUser, "role">;
}

export const middleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next(new CustomError("Token not Found!", 404));
  }
  try {
    const decode = verify(token, process.env.JWT_SECRET!) as TokenPayLoad;

    if (!decode?.role) {
      return next(new CustomError("Token is Missing!", 404));
    }
    req.user = { role: decode.role };
    next();
  } catch (error: unknown) {
    next(error);
  }
};
