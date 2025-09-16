import { Router } from "express";
import {
  createAssignment,
  deleteAssignment,
  getAssignmentByFilter,
  updateAssignment,
  updateStatus,
} from "../controllers/assignment.controller";
import { authorizeTeacher, middleware } from "../middleware/middleware";

const assignmentRouter = Router();

assignmentRouter.post(
  "/createAssignment",
  middleware,
  authorizeTeacher(),
  createAssignment
);

assignmentRouter.get("/getAssignment", middleware, getAssignmentByFilter);

assignmentRouter.put(
  "/updateAssignment/:id",
  middleware,
  authorizeTeacher(true),
  updateAssignment
);

assignmentRouter.put(
  "/updateStatus/:id",
  middleware,
  authorizeTeacher(true),
  updateStatus
);

assignmentRouter.delete(
  "/deleteAssignment/:id",
  middleware,
  authorizeTeacher(true),
  deleteAssignment
);

export default assignmentRouter;
