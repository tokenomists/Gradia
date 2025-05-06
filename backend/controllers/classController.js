import fs from 'fs';
import axios from 'axios';
import FormData from "form-data"; 
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Class from "../models/Class.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import Test from "../models/Test.js";
import Submission from "../models/Submission.js";

dotenv.config();

const GRADIA_API_KEY = process.env.GRADIA_API_KEY;
const GRADIA_PYTHON_BACKEND_URL = process.env.GRADIA_PYTHON_BACKEND_URL;

const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const createClass = async (req, res) => {
  try {
    const { name, description, classCode } = req.body;
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
      classCode: finalClassCode,
      teacher: teacher._id,
    });

    await Teacher.findByIdAndUpdate(teacher._id, { $push: { classes: newClass._id } });

    if (!GRADIA_API_KEY) {
      await Class.findByIdAndDelete(newClass._id);
      return res.status(500).json({ success: false, message: "API key not configured in environment" });
    }

    try {
      const gcsResponse = await axios.post(
        `${GRADIA_PYTHON_BACKEND_URL}/api/gcs/create-bucket`,
        { bucket_name: newClass._id.toString() },
        { headers: { "x-api-key": GRADIA_API_KEY } }
      );

      if (classFiles && classFiles.length > 0) {
        try {
          await uploadFilesToGCS(classFiles, newClass._id.toString());
        } catch (uploadError) {
          console.error("File upload error:", uploadError.message);
          return res.status(207).json({
            success: true,
            message: "Class creation and GCS bucket creation successful. File upload failed",
            class: newClass,
            fileUploadError: uploadError.message,
          });
        }
      }

      return res.status(201).json({
        success: true,
        message: "Class created and GCS bucket with Class Materials set up successfully",
        class: newClass,
        gcsResponse: gcsResponse.data,
      });

    } catch (gcsError) {
      console.error("GCS bucket creation error:", gcsError.message);

      await Class.findByIdAndDelete(newClass._id);
      await Teacher.findByIdAndUpdate(teacher._id, { $pull: { classes: newClass._id } });

      return res.status(500).json({
        success: false,
        message: "Failed to create Class. Error in GCS Bucket creation",
        error: gcsError.message,
      });
    }

  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      success: false,
      message: "Unexpected Server error while creating class",
      error: error.message,
    });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { classId } = req.body;

    const token = req.cookies.token;
    const decoded = getUserFromToken(token);

    if (!decoded || decoded.role !== "teacher") {
      return res.status(401).json({ success: false, message: "Unauthorized - Only teachers can delete classes" });
    }

    const teacher = await Teacher.findById(decoded.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    const classToDelete = await Class.findById(classId);
    if (!classToDelete) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    await Class.findByIdAndDelete(classId);

    await Teacher.findByIdAndUpdate(classToDelete.teacher, {
      $pull: { classes: classId },
    });

    await Student.updateMany(
      { classes: classId },
      { $pull: { classes: classId } }
    );

    const tests = await Test.find({ classAssignment: classId });
    const testIds = tests.map(test => test._id);

    await Submission.deleteMany({ test: { $in: testIds } });
    await Test.deleteMany({ _id: { $in: testIds } });
   
    try {
      await axios.delete(
        `${GRADIA_PYTHON_BACKEND_URL}/api/gcs/delete-bucket`,
        {
          headers: { "x-api-key": GRADIA_API_KEY, "Content-Type": "application/json" },
          data: { bucket_name: classId }
        }
      );
      
    } catch (gcsError) {
      console.error("Failed to delete GCS bucket:", gcsError.message);

      return res.status(207).json({
        success: true,
        message: "Class deleted successfully. Failed to delete GCS bucket",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting class:", error);
    return res.status(500).json({
      success: false,
      message: `Server error while deleting class ${error.message}`
    });
  }
};

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

export const joinClass = async (req, res) => {
  try {
    const { classCode } = req.body;
    
    if (!classCode) {
      return res.status(400).json({ success: false, message: "Class code is required" });
    }
    
    const token = req.cookies.token;
    const decoded = getUserFromToken(token);
    
    if (!decoded || decoded.role !== "student") {
      return res.status(401).json({ success: false, message: "Unauthorized - Only students can join classes" });
    }
    
    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    
    const classToJoin = await Class.findOne({ classCode });
    if (!classToJoin) {
      return res.status(404).json({ success: false, message: "Class not found with this code" });
    }
    
    if (classToJoin.students.includes(student._id)) {
      return res.status(400).json({ success: false, message: "You are already a member of this class" });
    }
    
    classToJoin.students.push(student._id);
    
    student.classes.push(classToJoin._id);
    
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
  const failedUploads = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(file.path));
    formData.append("bucket_name", bucketName);

    try {
      const response = await axios.post(`${GRADIA_PYTHON_BACKEND_URL}/api/gcs/upload-file`, formData, {
        headers: {
          "x-api-key": GRADIA_API_KEY,
          ...formData.getHeaders(),
        },
      });

      if (!response.data.success) {
        console.error(`Failed to upload ${file.originalname}`);
      }
    } catch (uploadErr) {
      console.error(`Failed to upload ${file.originalname} to GCS:`, uploadErr.message);
      failedUploads.push(file.originalname);
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

  if (failedUploads.length > 0) {
    throw new Error(`Failed to upload: ${failedUploads.join(', ')}`);
  }
};

export const getClassMaterials = async (req, res) => {
  try {
    const { classId } = req.body;

    const token = req.cookies.token;
    const decoded = getUserFromToken(token);

    if (!decoded || (decoded.role !== 'teacher' && decoded.role !== 'student')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!classId) {
      return res.status(400).json({ success: false, message: 'Missing classId' });
    }

    const response = await axios.post(
      `${GRADIA_PYTHON_BACKEND_URL}/api/gcs/list-files`,
      { bucket_name: classId },
      {
        headers: {
          'x-api-key': GRADIA_API_KEY,
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
    return res.status(500).json({ success: false, message: err.message });
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
      `${GRADIA_PYTHON_BACKEND_URL}/api/gcs/delete-file`,
      {
        headers: {
          'x-api-key': GRADIA_API_KEY,
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

export const downloadClassMaterial = async (req, res) => {
  try {
    const { classId, fileName } = req.body;

    const token = req.cookies.token;
    const decoded = getUserFromToken(token);

    if (!decoded || (decoded.role !== 'teacher' && decoded.role !== 'student')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!classId || !fileName) {
      return res.status(400).json({ success: false, message: 'Missing classId or fileName' });
    }

    const response = await axios.post(
      `${GRADIA_PYTHON_BACKEND_URL}/api/gcs/download-file`,
      { bucket_name: classId, file_name: fileName },
      {
        responseType: 'stream',
        headers: { 'x-api-key': GRADIA_API_KEY },
      }
    );

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');

    response.data.pipe(res);
  } catch (error) {
    console.error('Error downloading class material:', error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to download class material';
    return res.status(status).json({ success: false, message });
  }
};
