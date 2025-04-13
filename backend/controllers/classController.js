import fs from 'fs';
import axios from 'axios';
import FormData from "form-data"; 
import jwt from "jsonwebtoken";

import Class from "../models/Class.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";

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
    const classFiles = req.files;

    if (!name) {
      return res.status(400).json({ success: false, message: "Class name is required" });
    }

    const token = req.cookies.token;
    const decoded = getUserFromToken(token);

    if (!decoded || decoded.role !== "teacher") {
      return res.status(401).json({ success: false, message: "Unauthorized - Only teachers can create classes" });
    }

    const teacher = await Teacher.findById(decoded.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const finalClassCode = classCode || await Class.generateClassCode();

    const existingClass = await Class.findOne({ classCode: finalClassCode });
    if (existingClass) {
      return res.status(400).json({ success: false, message: "Class code already exists, please try again" });
    }

    const newClass = await Class.create({
      name,
      description,
      subject: req.body.subject,
      classCode: finalClassCode,
      teacher: teacher._id,
      invitedEmails: JSON.parse(invitedEmails),
    });

    await Teacher.findByIdAndUpdate(teacher._id, { $push: { classes: newClass._id } });

    const gradia_api_key = process.env.GRADIA_API_KEY;
    const gradia_python_backend_url = process.env.GRADIA_PYTHON_BACKEND_URL;

    if (!gradia_api_key) {
      return res.status(500).json({ success: false, message: "API key not configured in environment" });
    }

    try {
      const gcsResponse = await axios.post(
        `${gradia_python_backend_url}/create-gcs-bucket`,
        { bucket_name: newClass._id.toString() },
        { headers: { "x-api-key": gradia_api_key } }
      );

      if (classFiles && classFiles.length > 0) {
        await uploadFilesToGCS(classFiles, newClass._id.toString());
      }

      res.status(201).json({
        success: true,
        message: "Class created and GCS bucket with Class Materials set up successfully",
        class: newClass,
        gcsResponse: gcsResponse.data,
      });
    } catch (gcsError) {
      console.error("Error setting up GCS bucket:", gcsError.message);
      return res.status(500).json({ success: false, message: "Failed to set up GCS bucket" });
    }
  } catch (error) {
      console.error("Error creating class:", error);
        res.status(500).json({
        success: false,
        message: "Error creating class",
        error: error.message,
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

export const uploadFilesToGCS = async (files, bucketName) => {
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.path));
    formData.append("bucket_name", bucketName);

    try {
      await axios.post(`${process.env.GRADIA_PYTHON_BACKEND_URL}/upload-gcs-file`, formData, {
        headers: {
          "x-api-key": process.env.GRADIA_API_KEY,
          ...formData.getHeaders(),
        },
      });
    } catch (uploadErr) {
      console.error(`Failed to upload ${file.originalname} to GCS:`, uploadErr.message);
    } finally {
      try {
        fs.unlinkSync(file.path);
      } catch (delErr) {
        console.error(`Failed to delete ${file.path}:`, delErr.message);
      }
    }
  }

  try {
    const uploadDir = "uploads/";
    const filesInDir = fs.readdirSync(uploadDir);

    if (filesInDir.length === 0) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error("Error cleaning uploads dir:", err.message);
    }
  }
};

export const getClassMaterials = async (req, res) => {
  try {
    const { classId } = req.body;

    const token = req.cookies.token;
    const decoded = getUserFromToken(token);

    if (!decoded || decoded.role !== 'teacher') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!classId) {
      return res.status(400).json({ success: false, message: 'Missing classId' });
    }

    const response = await axios.post(
      `${process.env.GRADIA_PYTHON_BACKEND_URL}/list-gcs-files`,
      { bucket_name: classId },
      {
        headers: {
          'x-api-key': process.env.GRADIA_API_KEY,
        },
      }
    );

    return res.status(200).json({
      success: true,
      files: response.data || [],
    });
  } catch (error) {
    console.error('Error fetching class materials:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching class materials',
      error: error.message,
    });
  }
};

export const uploadClassMaterial = async (req, res) => {
  const files = req.files;
  const bucketName = req.body.bucketName;

  if (!files || files.length === 0 || !bucketName) {
    return res.status(400).json({ success: false, message: "Missing files or bucketName" });
  }

  try {
    await uploadFilesToGCS(files, bucketName);
    return res.status(200).json({ success: true, message: "Files uploaded successfully" });
  } catch (err) {
    console.error("Upload failed:", err.message);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
};

export const deleteClassMaterial = async (req, res) => {
  try {
    const { classId, fileName } = req.body;

    const token = req.cookies.token;
    const decoded = getUserFromToken(token);
    
    if (!decoded || decoded.role !== 'teacher') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!classId || !fileName) {
      return res.status(400).json({ success: false, message: 'Missing details. ClassId and FileName are required' });
    }
    
    const response = await axios.delete(
      `${process.env.GRADIA_PYTHON_BACKEND_URL}/delete-gcs-file`,
      {
        headers: {
          'x-api-key': process.env.GRADIA_API_KEY,
        },
        data: { bucket_name: classId, file_name: fileName }
      }
    );
    
    if (response.data && response.data.message && response.data.message.includes('deleted successfully')) {
      return res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete file.',
      });
    }
  } catch (error) {
    console.error('Error deleting file from GCS:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message,
    });
  }
};
