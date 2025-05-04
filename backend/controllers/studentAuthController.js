import Student from "../models/Student.js";
import Teacher from '../models/Teacher.js';
import Test from "../models/Test.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";
import Submission from "../models/Submission.js";

const generateToken = (id) => {
  return jwt.sign({ id, role: "student" }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 📌 Student Sign-up
export const registerStudent = async (req, res) => {
  try {
    const { fname, lname, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if(existingTeacher) {
      return res.status(400).json({ message: "This email is already registered as a Teacher." });
    }

    const student = await Student.create({ fname, lname, email, password });

    const token = generateToken(student._id);
    res.cookie("token", token, {
      httpOnly: true,  // Prevents access via JavaScript for security
      secure: process.env.NODE_ENV === "production",  // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production"
        ? "None"   // allow cross‑site in prod
        : "Lax",   // localhost fallback
      path: '/',
      maxAge: 3153600000,  // Cookie expiration time (100 years)
    });
    
    res.cookie("role", "student", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production"
        ? "None"   // allow cross‑site in prod
        : "Lax",   // localhost fallback
      path: '/',
      maxAge: 3153600000,
    });

    res.cookie("email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production"
        ? "None"   // allow cross‑site in prod
        : "Lax",   // localhost fallback
      path: '/',
      maxAge: 3153600000,
    });
    
    res.status(201).json({ message: "Student registered successfully", token: token });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'SERVER_ERROR',
      message: "Error registering student", 
      details: error.message 
    });
  }
};

// 📌 Student Login
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ success: false, message: "Student not found! Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(student._id);

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production"
          ? "None"   // allow cross‑site in prod
          : "Lax",   // localhost fallback
        path: '/',
        maxAge: 3153600000,
    });

    res.cookie("role", "student", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production"
        ? "None"   // allow cross‑site in prod
        : "Lax",   // localhost fallback
      path: '/',
      maxAge: 3153600000,
    });

    res.cookie("email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production"
        ? "None"   // allow cross‑site in prod
        : "Lax",   // localhost fallback
      path: '/',
      maxAge: 3153600000,
    });

    res.status(200).json({ success: true, message: "Student logged in successfully", token: token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error logging in", error: error.message });
  }
};

export const getStudentProfile = async (req, res) => {
    const { email, token } = req.cookies;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ success: false, message: "Student not found! Invalid email" });
    }
    
    // console.log(student);

    if(token) {
        return res.status(200).json(student);
    }
    res.status(403).json({message: "Unauthorized - No token found!"});
};

// Get all the attempted and upcoming tests for the student.
export const getStudentTests = async (req, res) => {
  try {
    // Extract JWT token from cookies
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    // console.log(token);

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = decoded.id;
    // console.log(studentId);

    // Find student and their enrolled classes
    const student = await Student.findById(studentId).populate("classes");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Extract class IDs
    const classIds = student.classes.map((cls) => cls._id);

    // Fetch upcoming and past tests
    const currentTime = new Date();

    // Get all tests (both upcoming and previous)
    const allTests = await Test.find({
      classAssignment: { $in: classIds }
    }).sort({ endTime: -1 });

    // Get student submissions for these tests
    const submissions = await Submission.find({
      student: studentId,
      test: { $in: allTests.map(t => t._id) }
    });

    const submittedTestIds = new Set(
      submissions.map(sub => sub.test.toString())
    );

    // Categorize tests with submission check
    const categorized = allTests.reduce((acc, test) => {
      const isSubmitted = submittedTestIds.has(test._id.toString());
      const isPastDeadline = test.endTime < currentTime;

      if (isSubmitted || isPastDeadline) {
        acc.previous.push(test);
      } else {
        acc.upcoming.push(test);
      }
      return acc;
    }, { upcoming: [], previous: [] });

    // Sort the results
    const upcomingTests = categorized.upcoming.sort(
      (a, b) => a.startTime - b.startTime
    );
    
    const previousTests = categorized.previous.sort(
      (a, b) => b.endTime - a.endTime
    );

    res.status(200).json({ upcomingTests, previousTests });
  } catch (error) {
    console.error("Error fetching student tests:", error);
    res.status(500).json({ message: "Error fetching tests", error: error.message });
  }
};

export const getStudentSubmissions = async (req, res) => {
  console.log("getStudentSubmissions function was called!");
  try {
    const token = req.cookies.token;
    // console.log("token: ", token);
    if(!token) return res.status(401).json({ message: "Unauthorized"});

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = decoded.id;
    // console.log("decoded: ", decoded);
    // console.log("student id: ", studentId);

    const submissions = await Submission.find({ student: studentId });
    res.status(200).json( submissions );
  } catch(error) {
    console.error("Error, failed to fetch submissions: ", error);
    res.status(500).json({ message: "Failed to fetch submissions!" });
  }
};

export const getStudentSubmissionByTestId = async (req, res) => {
  try {
    const token = req.cookies.token;
    // console.log("token: ", token);
    if(!token) return res.status(401).json({ message: "Unauthorized"});

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = decoded.id;

    const { testId } = req.params;

    const submission = await Submission.find({
      student: studentId,
      test: testId
    }).populate('test');

    res.status(200).json(submission);
  } catch (error) {
    console.error('Error, failed to get submission: ', error);
    res.status(500).json({ message: "Failed to get submission!" + error });
  }
};