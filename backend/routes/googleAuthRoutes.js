import express from "express";
import passport from "passport";

const router = express.Router();

// ✅ Google OAuth for Students
router.get("/student/google", passport.authenticate("student-google", { scope: ["profile", "email"] }));

router.get("/student/google/callback", passport.authenticate("student-google", { session: false }), (req, res) => {
  res.json({ message: "Student logged in with Google", token: req.user.token });
});

// ✅ Google OAuth for Teachers
router.get("/teacher/google", passport.authenticate("teacher-google", { scope: ["profile", "email"] }));

router.get("/teacher/google/callback", passport.authenticate("teacher-google", { session: false }), (req, res) => {
  res.json({ message: "Teacher logged in with Google", token: req.user.token });
});

export default router;
