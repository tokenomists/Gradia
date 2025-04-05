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

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = decoded.id;

    const [test, student] = await Promise.all([
      Test.findById(testId),
      Student.findById(studentId)
    ]);

    if (!test) return res.status(404).json({ message: "Test not found" });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const existingSubmission = await Submission.findOne({ test: testId, student: studentId });
    if (existingSubmission) {
      return res.status(400).json({ message: "Test already submitted" });
    }

    const gradedAnswers = [];
    const classId = test.classAssignment;
    let totalScore = 0;

    for (const ans of answers) {
      const question = test.questions.find(q => q._id.toString() === ans.questionId);
      if (!question) {
        return res.status(400).json({ message: `Invalid question ID: ${ans.questionId}` });
      }

      if (question.type !== ans.questionType) {
        return res.status(400).json({ message: `Incorrect question type for question ID: ${ans.questionId}` });
      }

      let score = 0;
      let feedback = "";

      if (question.type === "typed") {
        try {
          const gradingPayload = {
            question: question.questionText,
            student_answer: ans.answerText,
            max_mark: question.maxMarks,
            rubric: question.rubric ?? null,
            bucket_name: classId,
          };

          const response = await axios.post(
            `${process.env.GRADIA_PYTHON_BACKEND_URL}/grade`,
            gradingPayload,
            {
              headers: {
                "x-api-key": process.env.GRADIA_API_KEY
              }
            }
          );

          const { grade, feedback: fb, reference } = response.data;
          score = grade;
          feedback = `${fb}${reference ? ` \nReference: ${reference}` : ""}`;
        } catch (gradingError) {
          console.error(`Grading failed for question ${ans.questionId}:`, gradingError.message);
          return res.status(500).json({ message: "Grading failed", error: gradingError.message });
        }
      }

      totalScore += score;

      gradedAnswers.push({
        questionId: ans.questionId,
        answerText: ans.answerText,
        questionType: ans.questionType,
        score,
        feedback
      });
    }

    const submission = new Submission({
      test: testId,
      student: studentId,
      answers: gradedAnswers,
      totalScore,
      graded: true
    });

    await submission.save();
    res.status(201).json({ message: "Test submitted and graded successfully", submission });

  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
