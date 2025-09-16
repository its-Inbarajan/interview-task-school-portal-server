import { NextFunction, Request, Response } from "express";
import { CustomError } from "./global-error";
import { JwtPayload, verify } from "jsonwebtoken";
import { IUser } from "../models/auth.model";
import { ASSIGNMENT } from "../models/assignment.model";
import { Types } from "mongoose";

interface TokenPayLoad extends JwtPayload {
  userId?: string;
  role: "teacher" | "student";
}

interface CustomRequest extends Request {
  user?: Pick<IUser, "role" | "_id">;
}

interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    role: string;
  };
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
    req.user = { role: decode.role, _id: decode.userId };
    next();
  } catch (error: unknown) {
    next(error);
  }
};

export const authorizeTeacher = (checkOwnerShip: boolean = false) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new CustomError("Unauthorized", 401));
      }

      if (req.user.role !== "teacher") {
        return next(new CustomError("Forbidden: Teacher only", 403));
      }

      if (checkOwnerShip) {
        const assignmentId = req.params.id;
        const assignment = await ASSIGNMENT.findById(assignmentId);

        if (!assignment) {
          return next(new CustomError("Assignment not found", 404));
        }

        // ensure teacher can only CRUD their own assignments
        if (
          !(assignment.createdBy as Types.ObjectId).equals(
            new Types.ObjectId(req.user._id)
          )
        ) {
          console.log(req.user._id);
          return next(new CustomError("Not allowed: Not your assignment", 403));
        }
      }
      next();
    } catch (error: unknown) {
      next(error);
    }
  };
};
