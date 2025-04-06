import Test from "../models/Test.js";
import Class from "../models/Class.js";
import Student from "../models/Student.js";
import jwt from 'jsonwebtoken';
import Submission from "../models/Submission.js";
import axios from "axios";

export const createTest = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacherId = decoded.id;

    const {
      title, description, startTime, endTime, duration, classAssignment, questions, isDraft, createdBy, rubric, files
    } = req.body;
    if (!title || !startTime || !endTime || !duration || !classAssignment || !questions.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

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
      isDraft: isDraft ?? true,
    });

    newTest.maxMarks = questions.reduce((total, question) => total + (question.maxMarks || 0), 0);

    await newTest.save();

    await Class.findByIdAndUpdate(
      classAssignment,
      { $push: { tests: newTest._id } },
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
    if (existingSubmission) {
      return res.status(400).json({ message: "Test already submitted" });
    }

    for (const ans of answers) {
      const question = test.questions.find(q => q._id === ans.questionId);
      if (!question) {
        return res.status(400).json({ message: `Invalid question ID: ${ans.questionId}` });
      }
      if (question.type !== ans.questionType) {
        return res.status(400).json({ message: `Incorrect question type for question ID: ${ans.questionId}` });
      }
    }

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

export const getHeatmapData = async (req, res) => {
  try {
    console.log('Fetching heatmap data...');
    // Decode token to get teacher ID
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacherId = decoded.id;

    // Fetch only classes associated with the logged-in teacher
    const classes = await Class.find({ teacher: teacherId }, 'name _id');

    const heatmapData = {};

    for (const classDoc of classes) {
      const classId = classDoc._id;
      heatmapData[classDoc.name] = {};

      const tests = await Test.find({ classAssignment: classId }, '_id title questions createdAt', { sort: { createdAt: -1 } });

      for (const test of tests) {
        const testId = test._id;
        const totalPossibleMarks = test.questions.reduce((sum, q) => sum + q.maxMarks, 0);
        const submissions = await Submission.find({ test: testId, graded: true }, 'totalScore student');

        if (submissions.length === 0) {
          heatmapData[classDoc.name][test.title] = { 
            percentage: 'NA', 
            color: 'bg-gray-200',
            createdAt: test.createdAt // Include createdAt timestamp
          };
          continue;
        }

        const totalScoreSum = submissions.reduce((sum, sub) => sum + sub.totalScore, 0);
        const numStudents = submissions.length;
        const averagePercentage = (totalScoreSum * 100) / (numStudents * totalPossibleMarks);

        let color = 'bg-green-500';
        if (averagePercentage < 50) color = 'bg-red-500';
        else if (averagePercentage <= 75) color = 'bg-orange-400';

        heatmapData[classDoc.name][test.title] = { 
          percentage: averagePercentage.toFixed(2) + '%', 
          color,
          createdAt: test.createdAt // Include createdAt timestamp
        };
      }
    }

    console.log('Heatmap data:', heatmapData);
    res.json(heatmapData);
  } catch (error) {
    console.error('Heatmap data error:', error);
    res.status(500).json({ message: 'Error fetching heatmap data', error: error.message });
  }
};