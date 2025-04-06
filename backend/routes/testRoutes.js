import express from "express";
import { createTest, getTests, getTestById, submitTest, getHeatmapData } from "../controllers/testController.js";
import { getStudentSubmissions, getStudentTests } from "../controllers/studentAuthController.js";
import { getTeacherTests } from "../controllers/teacherAuthController.js";

const router = express.Router();

// Define static routes before dynamic routes to avoid conflicts
router.get("/heatmap", getHeatmapData); // Static route for heatmap data
router.post("/create-test", createTest);
router.get("/tests", getTests);
router.get("/student-tests", getStudentTests);
router.get("/teacher-tests", getTeacherTests);
router.post("/submit/:testId", submitTest);
router.get("/:testId", getTestById); // Dynamic route for test by ID

export default router;