import { NextFunction, Request, Response } from "express";
import { IUser, USERSCHEMA } from "../models/auth.model";
import { CustomError } from "../middleware/global-error";
import { IApiResponse } from "../@types/customApiResponse";
import { compare, hash } from "bcrypt";
import { generateToken } from "../service/helper";

export async function login(
  req: Request<{}, {}, IUser & { name?: string; role?: "teacher" | "student" }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return next(new CustomError("Email and password are required!", 400));
    }

    let findUser = await USERSCHEMA.findOne({ email });

    if (!findUser) {
      if (!name || !role) {
        const result: IApiResponse<{ requiresSignup: true }> = {
          message: "User not found. Please provide name and role to register.",
          status: 404,
          success: false,
          response: { requiresSignup: true },
        };
        return res.status(result.status).json(result);
      }

      const hashedPass = await hash(password, 10);
      findUser = await USERSCHEMA.create({
        email,
        password: hashedPass,
        name,
        role,
      });
    } else {
      const comparePass = await compare(password, findUser.password);
      if (!comparePass) {
        return next(new CustomError("Password does not match.", 400));
      }
    }

    const token = generateToken(findUser._id as string, findUser.role);

    const result: IApiResponse<{
      token: string;
      role: "teacher" | "student";
      userId: string;
      requiresSignup?: false;
    }> = {
      message: `Welcome ${findUser.name || ""}`,
      status: findUser ? 200 : 201,
      success: true,
      response: {
        token,
        role: findUser.role,
        userId: findUser._id as string,
        requiresSignup: false,
      },
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
