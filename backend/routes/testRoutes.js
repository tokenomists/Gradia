import express from "express";
import { createTest, getTests, getTestById } from "../controllers/testController.js";
import { getStudentTests } from "../controllers/studentAuthController.js";
import { getTeacherTests } from "../controllers/teacherAuthController.js";

const router = express.Router();

router.post("/create-test", createTest);
router.get("/tests", getTests);
router.get("/tests/:testId", getTestById);
router.get("/student-tests", getStudentTests);
router.get("/teacher-tests", getTeacherTests);

export default router;
