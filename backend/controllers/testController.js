import Test from "../models/Test.js";
import Class from "../models/Class.js";
import Student from "../models/Student.js";
import jwt from 'jsonwebtoken';
import Submission from "../models/Submission.js";
import axios from "axios";

export const createTest = async (req, res) => {
  try {
    // Extract JWT token from cookies
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacherId = decoded.id;

    // Extract test data from request body
    const {
      title, description, startTime, endTime, duration, classAssignment, questions, isDraft, createdBy, rubric, files
    } = req.body;
    // console.log(req.body);
    // Validate required fields
    if (!title || !startTime || !endTime || !duration || !classAssignment || !questions.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create new test
    const newTest = new Test({
      title,
      description,
      startTime,
      endTime,
      duration,
      classAssignment,
      createdBy,
      questions,
      rubric,
      files,
      isDraft: isDraft ?? true, // Default to draft if not provided
    });

    newTest.maxMarks = questions.reduce((total, question) => total + (question.maxMarks || 0), 0);

    // Save to DB
    await newTest.save();

    // Add the test to the assigned class
    await Class.findByIdAndUpdate(
      classAssignment,
      { $push: { tests: newTest._id } }, // Add test ID to class
      { new: true }
    );

    res.status(201).json({ message: "Test created successfully!", test: newTest });
  } catch (error) {
    console.error("Error publishing test:", error);
    res.status(500).json({ message: "Failed to publish test", error: error.message });
  }
};

export const getTests = async (req, res) => {
  try {
    const tests = await Test.find({ createdBy: req.user.id }).populate("classId", "className");
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tests", error: error.message });
  }
};

export const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId).populate("classAssignment");
    if (!test) return res.status(404).json({ message: "Test not found" });

    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ message: "Error fetching test", error: error.message });
  }
};

export const submitTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const token = req.cookies.token;
    const { answers } = req.body;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = decoded.id;

    const [test, student] = await Promise.all([
      Test.findById(testId),
      Student.findById(studentId),
    ]);

    if (!test || !student)
      return res.status(404).json({ message: "Test or Student not found" });

    const existingSubmission = await Submission.findOne({ test: testId, student: studentId });
    if (existingSubmission)
      return res.status(400).json({ message: "Test already submitted" });

    const submission = new Submission({
      test: testId,
      student: studentId,
      answers,
      totalScore: 0,
      graded: false,
    });

    await submission.save();

    axios.post(`${process.env.BACKEND_URI}/api/grade/grade-submission`, {
      submissionId: submission._id,
    }).catch((err) => {
      console.error("Failed to trigger grading:", err.message);
    });

    res.status(201).json({
      message: "Submission received. Grading will be done soon.",
      submissionId: submission._id,
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
