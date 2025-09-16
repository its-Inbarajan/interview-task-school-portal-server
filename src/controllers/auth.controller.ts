import { NextFunction, Request, Response } from "express";
import { IUser, USERSCHEMA } from "../models/auth.model";
import { CustomError } from "../middleware/global-error";
import { IApiResponse } from "../@types/customApiResponse";
import { compare, hash } from "bcrypt";
import { generateToken } from "../service/helper";

export async function login(
  req: Request<{}, {}, IUser>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password }: IUser = req.body;
    if (!email || !password) {
      return next(new CustomError("Every field is required!", 400));
    }

    const findUser = await USERSCHEMA.findOne({ email: email });
    if (!findUser) {
      return next(new CustomError("User not found!", 400));
    }

    const token = generateToken(findUser?._id as string, findUser?.role);
    const camparePass = await compare(password, findUser.password);
    if (!camparePass) {
      return next(new CustomError("Password is not match.", 400, false));
    }
    const result: IApiResponse<{
      token: string;
      role: "teacher" | "student";
      userId: unknown;
    }> = {
      message: `Welcome ${findUser.name || ""}`,
      status: 201,
      success: true,
      response: { token: token, role: findUser.role, userId: findUser._id },
    };
    res.status(result.status).json(result);
  } catch (error: unknown) {
    next(error);
  }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, role, email, password }: IUser = req.body;

    if (!name || !role || !email || !password) {
      return next(new CustomError("Every field is required!", 400));
    }

    const findUser = await USERSCHEMA.findOne({ email: email });
    if (findUser) {
      return next(new CustomError("User already exist, Please login.", 400));
    }

    const hashed = await hash(password as string, 10);
    const result = await USERSCHEMA.create({
      name,
      email,
      password: hashed,
      role,
    });

    if (!result) {
      return next(new CustomError("Something went wrong!.", 400));
    }
    const response: IApiResponse<string> = {
      message: `Successfully Sign-up, Please login.`,
      status: 201,
      success: true,
    };

    res.status(response.status).json(result);
  } catch (error: unknown) {
    next(error);
  }
}
