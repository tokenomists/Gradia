import express from 'express';
const router = express.Router();
import passport from 'passport';
import { registerStudent, loginStudent, getStudentProfile } from '../controllers/studentAuthController.js';
import { registerTeacher, loginTeacher, getTeacherProfile } from '../controllers/teacherAuthController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

const CLIENT_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Get student details
router.get('/student/profile', authMiddleware, getStudentProfile);

// Get teacher details
router.get('/teacher/profile', authMiddleware,getTeacherProfile);

// Student Google Auth
router.get(
    "/student/google",
    passport.authenticate("student-google", { scope: ["profile", "email"] })
);

router.get(
  "/student/google/callback",
  (req, res, next) => {
    passport.authenticate("student-google", (err, userData) => {
      if (err) {
        // Handle server error
        return res.redirect(`${CLIENT_URL}/?error=AUTH_ERROR&message=${encodeURIComponent('Authentication failed. Please try again.')}`);
      }
      
      if (!userData) {
        return res.redirect(`${CLIENT_URL}/?error=AUTH_ERROR&message=${encodeURIComponent('Authentication failed. Please try again.')}`);
      }
      
      // Check if this is an error response from our strategy
      if (userData.error) {
        return res.redirect(`${CLIENT_URL}/?error=${userData.errorCode}&message=${encodeURIComponent(userData.message)}`);
      }
      
      // Success, set cookies and redirect
      const { token, email } = userData;
      
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

      res.cookie("email", email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 3600000,
      });

      // Redirect to success page
      res.redirect(`${CLIENT_URL}/oauth-success?token=${token}&role=student`);
    })(req, res, next);
  }
);
  
// Teacher Google Auth
router.get(
  "/teacher/google",
  passport.authenticate("teacher-google", { scope: ["profile", "email"] })
);

router.get(
  "/teacher/google/callback",
  (req, res, next) => {
    passport.authenticate("teacher-google", (err, userData) => {
      if (err) {
        // Handle server error
        return res.redirect(`${CLIENT_URL}/?error=AUTH_ERROR&message=${encodeURIComponent('Authentication failed. Please try again.')}`);
      }
      
      if (!userData) {
        return res.redirect(`${CLIENT_URL}/?error=AUTH_ERROR&message=${encodeURIComponent('Authentication failed. Please try again.')}`);
      }
      
      // Check if this is an error response from our strategy
      if (userData.error) {
        return res.redirect(`${CLIENT_URL}/?error=${userData.errorCode}&message=${encodeURIComponent(userData.message)}`);
      }
      
      // Success, set cookies and redirect
      const { token, email, picture } = userData;
      
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

      res.cookie("email", email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 3600000,
      });

      res.cookie("profilePicture", picture, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 3600000,
      });

      // Redirect to success page
      res.redirect(`${CLIENT_URL}/oauth-success?token=${token}&role=teacher`);
    })(req, res, next);
  }
);

router.get("/check", async (req, res) => {
  if (Object.entries(req.cookies).length > 0) {
    const Model = req.cookies.role === "student" ? Student : Teacher;
    
    try {
      let userQuery = Model.findOne({ email: req.cookies.email });

      // Populate classes only for students
      if (req.cookies.role === "student") {
        userQuery = userQuery.populate("classes"); 
      }

      const user = await userQuery.select("-password"); // Exclude password from response


      if (!user) {
        return res.json({ isAuthenticated: false });
      }
      
      res.json({ 
        isAuthenticated: true,
        role: req.cookies.role,
        token: req.cookies.token,
        ...user._doc,
        name: user.lname ? `${user.fname} ${user.lname}` : user.fname,
        profilePic: user.profilePicture
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