import Class from "../models/Class.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import jwt from "jsonwebtoken";

// Helper function to extract user info from JWT token
const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Create a new class
export const createClass = async (req, res) => {
  try {
    const { name, description, subjects, invitedEmails, classCode } = req.body;
    
    // Validate the request
    if (!name) {
      return res.status(400).json({ success: false, message: "Class name is required" });
    }
    
    // Get teacher from token
    const token = req.cookies.token;
    const decoded = getUserFromToken(token);
    
    if (!decoded || decoded.role !== "teacher") {
      return res.status(401).json({ success: false, message: "Unauthorized - Only teachers can create classes" });
    }
    
    // Find the teacher
    const teacher = await Teacher.findById(decoded.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }
    
    // Generate class code if not provided
    const finalClassCode = classCode || await Class.generateClassCode();
    
    // Check if class code already exists
    const existingClass = await Class.findOne({ classCode: finalClassCode });
    if (existingClass) {
      return res.status(400).json({ success: false, message: "Class code already exists, please try again" });
    }
    
    // Create the class
    const newClass = await Class.create({
      name,
      description,
      subjects,
      classCode: finalClassCode,
      teacher: teacher._id,
      invitedEmails
    });
    
    res.status(201).json({ 
      success: true, 
      message: "Class created successfully", 
      class: newClass 
    });
    
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating class", 
      error: error.message 
    });
  }
};

// Get all classes for a teacher
export const getTeacherClasses = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = getUserFromToken(token);
    
    if (!decoded || decoded.role !== "teacher") {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const classes = await Class.find({ teacher: decoded.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      classes 
    });
    
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching classes", 
      error: error.message 
    });
  }
};

// Join a class (for students)
export const joinClass = async (req, res) => {
  try {
    const { classCode } = req.body;
    
    if (!classCode) {
      return res.status(400).json({ success: false, message: "Class code is required" });
    }
    
    // Get student from token
    const token = req.cookies.token;
    const decoded = getUserFromToken(token);
    
    if (!decoded || decoded.role !== "student") {
      return res.status(401).json({ success: false, message: "Unauthorized - Only students can join classes" });
    }
    
    // Find the student
    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    
    // Find the class
    const classToJoin = await Class.findOne({ classCode });
    if (!classToJoin) {
      return res.status(404).json({ success: false, message: "Class not found with this code" });
    }
    
    // Check if student is already in the class
    if (classToJoin.students.includes(student._id)) {
      return res.status(400).json({ success: false, message: "You are already a member of this class" });
    }
    
    // Add student to class
    classToJoin.students.push(student._id);
    
    // Also add class to student's classes array
    student.classes.push(classToJoin._id);

    // Remove from invited emails if present
    if (classToJoin.invitedEmails.includes(student.email)) {
      classToJoin.invitedEmails = classToJoin.invitedEmails.filter(email => email !== student.email);
    }
    
    await classToJoin.save();
    await student.save();
    
    res.status(200).json({ 
      success: true, 
      message: "Successfully joined the class", 
      class: classToJoin 
    });
    
  } catch (error) {
    console.error("Error joining class:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error joining class", 
      error: error.message 
    });
  }
};

// Get class details
export const getClassDetails = async (req, res) => {
  try {
    const { classId } = req.params;
    
    const token = req.cookies.token;
    const decoded = getUserFromToken(token);
    
    if (!decoded) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const classDetails = await Class.findById(classId)
      .populate('teacher', 'fname lname email profilePicture')
      .populate('students', 'fname lname email profilePicture');
    
    if (!classDetails) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }
    
    // Verify user has access to this class
    const isTeacher = decoded.role === "teacher" && 
                      classDetails.teacher._id.toString() === decoded.id;
    
    const isStudent = decoded.role === "student" && 
                      classDetails.students.some(student => student._id.toString() === decoded.id);
    
    if (!isTeacher && !isStudent) {
      return res.status(403).json({ success: false, message: "You don't have access to this class" });
    }
    
    res.status(200).json({ 
      success: true, 
      class: classDetails 
    });
    
  } catch (error) {
    console.error("Error fetching class details:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching class details", 
      error: error.message 
    });
  }
};