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
      const { user, token } = req.user;
      
      // ✅ Redirect to frontend with token
      res.redirect(`${CLIENT_URL}/oauth-success?token=${token}&role=student`);
    }
  );
  
  router.get(
    "/teacher/google/callback",
    passport.authenticate("teacher-google", { failureRedirect: `${CLIENT_URL}/signin` }),
    (req, res) => {
      const { user, token } = req.user;
      
      // ✅ Redirect to frontend with token
      res.redirect(`${CLIENT_URL}/oauth-success?token=${token}&role=teacher`);
    }
  );
  
  
// Teacher Google Auth
router.get(
    "/teacher/google",
    passport.authenticate("teacher-google", { scope: ["profile", "email"] })
);
  
router.get(
    "/teacher/google/callback",
    passport.authenticate("teacher-google", { failureRedirect: `${CLIENT_URL}/signin` }),
    (req, res) => {
        const { user, token } = req.user;

        // ✅ Send token to frontend
        res.redirect(`${CLIENT_URL}/oauth-success?token=${token}&role=teacher`);
    }
);

// Student Auth Routes
router.post("/student/register", registerStudent);
router.post("/student/login", loginStudent);

// Teacher Auth Routes
router.post("/teacher/register", registerTeacher);
router.post("/teacher/login", loginTeacher);

export default router;