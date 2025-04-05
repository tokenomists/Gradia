import express from "express";
import { createTest, getTests, getTestById, submitTest } from "../controllers/testController.js";
import { getStudentSubmissions, getStudentTests } from "../controllers/studentAuthController.js";
import { getTeacherTests } from "../controllers/teacherAuthController.js";

const router = express.Router();

router.post("/create-test", createTest);
router.get("/tests", getTests);
router.get("/:testId", getTestById);
router.get("/student-tests", getStudentTests);
router.get("/teacher-tests", getTeacherTests);
router.post("/submit/:testId", submitTest);

export default router;
