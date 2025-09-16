import { Router } from "express";
import { middleware } from "../middleware/middleware";
import {
  createSubmission,
  viewSubmission,
} from "../controllers/submission.controller";

const submissionRouter = Router();

submissionRouter.post("/", middleware, createSubmission);
submissionRouter.get("/viewSubmission/:id", middleware, viewSubmission);

export default submissionRouter;
