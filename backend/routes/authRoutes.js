import express from 'express';
const router = express.Router();
import passport from 'passport';
import { registerStudent, loginStudent, getStudentProfile } from '../controllers/studentAuthController.js';
import { registerTeacher, loginTeacher, getTeacherProfile } from '../controllers/teacherAuthController.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

const CLIENT_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Get student details
router.get('/student/profile', getStudentProfile);

// Get teacher details
router.get('/teacher/profile', getTeacherProfile);

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

    res.cookie("email", req.user.email, {
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

    res.cookie("email", req.user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    res.cookie("profilePicture", req.user.picture, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    // Redirect to frontend with token
    res.redirect(`${CLIENT_URL}/oauth-success?token=${token}&role=teacher`);
  }
);

router.get("/check", async (req, res) => {
  if (Object.entries(req.cookies).length > 0) {
    const Model = req.cookies.role === "student" ? Student : Teacher;
    
    try {
      const user = await Model.findOne({ email: req.cookies.email });

      if (!user) {
        return res.json({ isAuthenticated: false });
      }

      res.json({ 
        isAuthenticated: true,
        role: req.cookies.role,
        email: user.email,
        token: req.cookies.token,
        name: (user.lname === undefined ? user.fname : `${user.fname} ${user.lname}`),
        profilePic: user.profilePicture,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.json({ isAuthenticated: false });
  }
});


// Student Auth Routes
router.post("/student/register", registerStudent);
router.post("/student/login", loginStudent);
// router.get("/student/delete", deleteStudent);

// Teacher Auth Routes
router.post("/teacher/register", registerTeacher);
router.post("/teacher/login", loginTeacher);
// router.get("/teacher/delete", deleteTeacher);

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