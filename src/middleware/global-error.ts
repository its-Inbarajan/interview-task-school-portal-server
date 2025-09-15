import { NextFunction, Request, Response } from "express";

export class CustomError extends Error {
  public statusCode: number;
  public success: boolean;

  constructor(message: string, statusCode: number, success: boolean = false) {
    super(message);
    this.statusCode = statusCode;
    this.success = success;

    // Ensure the error stack trace is captured
    Error.captureStackTrace(this, this.constructor);
  }
}

export const GlobalError = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.statusCode || 500;
  const success = err.success || false;
  const stack = err.stack;
  res.status(status).json({
    success,
    message: err.message || "Internal Server Error",
    status,
    stack: process.env.NODE_ENV === "development" ? stack : undefined,
  });
};
