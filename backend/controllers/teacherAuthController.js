import Teacher from "../models/Teacher.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";

const generateToken = (id) => {
  return jwt.sign({ id, role: "teacher" }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// 📌 Teacher Sign-up
export const registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Teacher already exists" });
    }

    const teacher = await Teacher.create({ name, email, password });
    res.status(201).json({ message: "Teacher registered successfully", token: generateToken(teacher._id) });

  } catch (error) {
    res.status(500).json({ message: "Error registering teacher", error: error.message });
  }
};

// 📌 Teacher Login
export const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(teacher._id);

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

    res.status(200).json({ success: true, message: "Teacher logged in successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error logging in", error: error.message });
  }
};
