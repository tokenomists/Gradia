import express from "express";
const router = express.Router();
import { gradeSubmission } from "../controllers/gradingController.js";

router.post("/grade-submission", gradeSubmission);

export default router;

