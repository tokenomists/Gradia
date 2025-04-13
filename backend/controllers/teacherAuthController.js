import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import Test from "../models/Test.js";
import Class from "../models/Class.js";

const generateToken = (id) => {
  return jwt.sign({ id, role: "teacher" }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Teacher Sign-up
export const registerTeacher = async (req, res) => {
  try {
    const { fname, lname, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Teacher already exists" });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "This email is already registered as a student" });
    }

    await Teacher.create({ fname, lname, email, password });    

    res.status(201).json({ message: "Teacher registered successfully" });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'SERVER_ERROR',
      message: "Error registering student", 
      details: error.message 
    });
  }
};

// Teacher Login
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
        maxAge: 3153600000,
    });

    res.cookie("role", "teacher", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3153600000,
   });

   res.cookie("email", email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 3153600000,
  });

    res.status(200).json({ success: true, message: "Teacher logged in successfully", token: token });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error logging in", error: error.message });
  }
};

export const getTeacherProfile = async (req, res) => {
  const { email, token } = req.cookies;

  const teacher = await Teacher.findOne({ email });
  if (!teacher) {
    return res.status(400).json({ success: false, message: "Teacher not found! Invalid email" });
  }
  
  console.log(teacher);

  if(token) {
      return res.status(200).json({ email: email,  });
  }
  res.status(403).json({message: "Unauthorized - No token found!"});
};

// Get all the tests created by the teacher.
export const getTeacherTests = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacherId = decoded.id;

    const testsData = await Test.find({
      createdBy: teacherId
    });

    const currentTime = new Date();
    const upcomingTests = await Test.find({
      createdBy: teacherId,
      startTime: { $gte: currentTime },
    }).sort({ startTime: 1 });

    const previousTests = await Test.find({
      createdBy: teacherId,
      endTime: { $lt: currentTime },
    }).sort({ endTime: -1 });
    // console.log({ testsData, upcomingTests, previousTests });
    res.status(200).json({ testsData, upcomingTests, previousTests });
  } catch (error) {
    res.status(500).json({ message: "Error fetching tests", error: error.message });
  }
};

export const getTeacherClasses = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacherId = decoded.id;

    const classesData = await Class.find({
      teacher: teacherId
    });
    
    res.status(200).json(classesData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tests", error: error.message });
  }
};