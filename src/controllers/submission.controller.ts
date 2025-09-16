import { NextFunction, Request, Response } from "express";
import { ISubmission, SUBMISSIONSCHEMA } from "../models/submission.model";
import { CustomError } from "../middleware/global-error";
import { IApiResponse } from "../@types/customApiResponse";
import { ASSIGNMENT } from "../models/assignment.model";
import { USERSCHEMA } from "../models/auth.model";

export async function createSubmission(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      assignmentId,
      studentId,
      answer,
      submittedAt,
      reviewed,
    }: ISubmission = req.body;

    if (!assignmentId || !studentId || !answer || !submittedAt) {
      return next(new CustomError("Every field must not be empty.", 400));
    }

    const [assignment, student] = await Promise.all([
      await ASSIGNMENT.findById(assignmentId),
      await USERSCHEMA.findById(studentId),
    ]);
    if (!assignment) {
      return next(new CustomError("Assignment is found!", 404));
    }

    if (!student) {
      return next(new CustomError("Student is found!", 404));
    }

    const result = await SUBMISSIONSCHEMA.create({
      assignmentId,
      studentId,
      answer,
      submittedAt,
      reviewed,
    });

    const populated = await result.populate(
      "assignmentId studentId",
      "-password -__v"
    );

    if (!result) {
      return next(new CustomError("Something went wrong!", 400));
    }

    const response: IApiResponse<ISubmission> = {
      message: "Thanks for submission.",
      status: 201,
      success: true,
      response: populated,
    };

    res.status(response.status).json(response);
  } catch (error: unknown) {
    next(error);
  }
}

export async function viewSubmission(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const findById = await SUBMISSIONSCHEMA.findById(id);

    if (!findById) return next(new CustomError("Submission not found!", 404));

    const [assignment, student] = await Promise.all([
      await ASSIGNMENT.findById(findById.assignmentId),
      await USERSCHEMA.findById(findById.studentId),
    ]);

    if (!assignment) {
      return next(new CustomError("Assignment not found!", 404));
    }
    if (!student) {
      return next(new CustomError("Student not found!", 404));
    }
    const populate = await findById.populate(
      "assignmentId studentId",
      "-__v -password -role"
    );
    const response: IApiResponse<ISubmission> = {
      message: "Fetched successfully",
      status: 200,
      success: true,
      response: populate,
    };

    res.status(response.status).json(response);
  } catch (error: unknown) {
    next(error);
  }
}
