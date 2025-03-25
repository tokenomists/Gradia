import Student from "../models/Student.js";
import Teacher from '../models/Teacher.js';
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";

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
      sameSite: "Strict",  // Prevent CSRF attacks
      maxAge: 3600000,  // Cookie expiration time (1 hour)
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