import { NextFunction, Request, Response } from "express";
import { ASSIGNMENT, IAssignment } from "../models/assignment.model";
import { CustomError } from "../middleware/global-error";
import { IApiResponse } from "../@types/customApiResponse";
import { FilterQuery } from "mongoose";

export async function createAssignment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { title, description, dueDate, status, createdBy }: IAssignment =
      req.body;

    if (!title || !description || !dueDate || !status || !createdBy) {
      return next(new CustomError("Every fields must not be empty!", 400));
    }

    const find = await ASSIGNMENT.findOne({ title: title });

    if (find) {
      return next(new CustomError("Assignment Title Already exist!", 400));
    }

    const response = await ASSIGNMENT.create({
      title,
      description,
      dueDate,
      status,
      createdBy,
    });

    await response.populate("createdBy", "-password -__v");
    if (!response) {
      return next(new CustomError("Something went wrong!", 400));
    }

    const result: IApiResponse<IAssignment> = {
      message: "Assignment created successfully.",
      status: 201,
      success: true,
      response: response,
    };

    res.status(result.status).json(result);
  } catch (error: unknown) {
    next(error);
  }
}

export async function getAssignmentByFilter(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page.toString(), 10);
    const pageLimit = parseInt(limit.toString(), 10);

    let filtreQuery: FilterQuery<IAssignment> = {};
    if (status) filtreQuery.status = status;

    const findFilteredDoc = await ASSIGNMENT.find(filtreQuery)
      .skip((pageNumber - 1) * pageLimit)
      .limit(pageLimit)
      .populate({
        path: "answers",
        select: "-__v -assignmentId",
        populate: {
          path: "studentId",
          select: "name email role",
        },
      });

    const count = await ASSIGNMENT.countDocuments(filtreQuery);

    const response: IApiResponse<IAssignment[]> = {
      message: "Fetched successfully.",
      success: true,
      status: 200,
      response: findFilteredDoc,
      pagination: {
        limit: pageLimit,
        page: pageNumber,
        total_count: count,
      },
    };
    res.status(response.status).json(response);
  } catch (error: unknown) {
    next(error);
  }
}

export async function getAssignmentById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const findById = await ASSIGNMENT.findById(id);
    const populate = await findById?.populate([
      { path: "createdBy", select: "name email role" },
      {
        path: "answers",
        select: "-__v -assignmentId",
        populate: {
          path: "studentId",
          select: "name email role",
        },
      },
    ]);
    if (!findById) return next(new CustomError("Assignment not found!", 404));

    const response: IApiResponse<IAssignment> = {
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

export async function updateAssignment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { title, description, dueDate, status }: IAssignment = req.body;

    if (!title || !description || !dueDate || !status) {
      return next(new CustomError("Every fields must not be empty!", 400));
    }
    const find = await ASSIGNMENT.findOne({ _id: id });

    if (!find) {
      return next(new CustomError("Assignment not found!", 404));
    }
    if (find.status !== "draft") {
      return next(
        new CustomError(`Assignment in ${find.status} can't be edited.`, 400)
      );
    }
    const result = await ASSIGNMENT.findByIdAndUpdate(
      id,
      {
        title,
        description,
        dueDate,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!result) {
      return next(new CustomError("Something went wrong!", 400));
    }

    const response: IApiResponse<IAssignment> = {
      message: "Assignement updated successfully.",
      status: 200,
      success: true,
      response: result,
    };

    res.status(response.status).json(response);
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { status } = req.query;
    const find = await ASSIGNMENT.findOne({ _id: id });

    if (!find) {
      return next(new CustomError("Assignment not found!", 404));
    }
    if (
      !status ||
      !["draft", "pubished", "completed"].includes(status.toString())
    ) {
      return res.status(400).send({ message: "Invalid status provided." });
    }

    const result = await ASSIGNMENT.findByIdAndUpdate(
      id,
      {
        status: status,
      },
      { new: true, runValidators: true }
    );

    if (!result) {
      return next(new CustomError("Something went wrong!", 400));
    }

    const response: IApiResponse<IAssignment> = {
      message: "Assignement updated successfully.",
      status: 200,
      success: true,
      response: result,
    };

    res.status(response.status).json(response);
  } catch (error: unknown) {
    next(error);
  }
}

export async function deleteAssignment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const findOne = await ASSIGNMENT.findById(id);

    if (!findOne) {
      return next(new CustomError("Assignement not found!", 400));
    }

    if (findOne.status !== "draft") {
      return next(
        new CustomError(
          `Assignment in ${findOne.status} can't be deleted.`,
          400
        )
      );
    }

    const result = await ASSIGNMENT.findByIdAndDelete(id);

    if (!result) {
      return next(new CustomError("Something went wrong!", 400));
    }

    const response: IApiResponse<IAssignment> = {
      message: "Assignement deleted successfully.",
      status: 200,
      success: true,
      response: result,
    };

    res.status(response.status).json(response);
  } catch (error: unknown) {
    next(error);
  }
}
