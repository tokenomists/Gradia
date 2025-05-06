import express from "express";
import {
  startTestSession,
  getTestSession,
  updateTestSession,
  markTestSessionStarted,
  submitTestSession
} from "../controllers/testSessionController.js";

const router = express.Router();

router.post("/start", startTestSession);
router.get("/:testId", getTestSession);
router.patch("/:sessionId", updateTestSession);
router.patch("/:sessionId/start", markTestSessionStarted);
router.post("/:sessionId/submit", submitTestSession);

export default router;
