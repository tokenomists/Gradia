import express from 'express';
const router = express.Router();
import passport from 'passport';
import { registerStudent, loginStudent } from '../controllers/studentAuthController.js';
import { registerTeacher, loginTeacher } from '../controllers/teacherAuthController.js';

const CLIENT_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Student Google Auth
router.get(
    "/student/google",
    passport.authenticate("student-google", { scope: ["profile", "email"] })
);

router.get(
  "/student/google/callback",
  passport.authenticate("student-google", { failureRedirect: `${CLIENT_URL}/signin` }),
  (req, res) => {
    const { token } = req.user;
    console.log(token);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    res.cookie("role", "student", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    res.cookie("name", `${req.user.user.fname} ${req.user.user.lname}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    // Redirect to frontend with token
    res.redirect(`${CLIENT_URL}/oauth-success?token=${token}&role=student`);
  }
);
  
// Teacher Google Auth
router.get(
  "/teacher/google",
  passport.authenticate("teacher-google", { scope: ["profile", "email"] })
);

router.get(
  "/teacher/google/callback",
  passport.authenticate("teacher-google", { failureRedirect: `${CLIENT_URL}` }),
  (req, res) => {
    const { token } = req.user;
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    res.cookie("role", "teacher", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    res.cookie("name", `${req.user.user.fname} ${req.user.user.lname}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    // Redirect to frontend with token
    res.redirect(`${CLIENT_URL}/oauth-success?token=${token}&role=teacher`);
  }
);

router.get("/check", (req, res) => {
  console.log("Cookies received:", req.cookies);

  if (Object.entries(req.cookies).length > 0) {
      res.json({ isAuthenticated: true });
  } else {
      res.json({ isAuthenticated: false });
  }
});

// Student Auth Routes
router.post("/student/register", registerStudent);
router.post("/student/login", loginStudent);

// Teacher Auth Routes
router.post("/teacher/register", registerTeacher);
router.post("/teacher/login", loginTeacher);

router.post("/logout", (req, res) => {
  for(const cookie in req.cookies) {
    res.clearCookie(cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
  }

  return res.json({ success: true, message: "Logged out successfully" });
});

export default router;