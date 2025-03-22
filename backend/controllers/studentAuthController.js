import Student from "../models/Student.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";

const generateToken = (id) => {
  return jwt.sign({ id, role: "student" }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 📌 Student Sign-up
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const student = await Student.create({ name, email, password });
    res.status(201).json({ message: "Student registered successfully", token: generateToken(student._id) });

  } catch (error) {
    res.status(500).json({ message: "Error registering student", error: error.message });
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

    res.cookie("email", email, {
        httpOnly: true, // Allow client-side access if needed (consider security implications)
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 3600000, // 1 hour (same as token)
    });

    res.status(200).json({ success: true, message: "Student logged in successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error logging in", error: error.message });
  }
};

export const getStudentProfile = async (req, res) => {
    const { email, token } = req.cookies;
    if(token) {
        return res.status(200).json({ email: email, password: token });
    }
    res.status(403).json({message: "Unauthorized - No token found!"});
};