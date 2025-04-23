import axios from "axios";
import jwt from 'jsonwebtoken';
import FormData from "form-data";
import { Buffer } from "buffer";
import Test from "../models/Test.js";
import Class from "../models/Class.js";
import Student from "../models/Student.js";
import Submission from "../models/Submission.js";

export const gradeSubmission = async (submissionId) => {
  const submission = await Submission.findById(submissionId);
  if (!submission) throw new Error("Submission not found");

  const test = await Test.findById(submission.test);
  if (!test) throw new Error("Test not found");

  const classId = test.classAssignment;
  let totalScore = 0;
  const gradedAnswers = [];

  for (const ans of submission.answers) {
    const question = test.questions.find(q => q._id.toString() === ans.questionId);
    if (!question) continue;

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
          `${process.env.GRADIA_PYTHON_BACKEND_URL}/api/grading/grade-answer`,
          gradingPayload,
          {
            headers: {
              "x-api-key": process.env.GRADIA_API_KEY,
            },
          }
        );

        const { grade, feedback: fb, reference } = response.data;
        score = grade;
        feedback = `${fb}${reference ? ` \nReference: ${reference}` : ""}`;
      } catch (err) {
        console.error(`Grading failed for typed question ${ans.questionId}:`, err.message);
      }
    }

    else if (question.type === "coding") {
      try {
        const source_code = ans.codeAnswer;
        const language = "python3";

        const test_cases = question.testCases.map((tc) => ({
          input: tc.input,
          expected_output: tc.output,
        }));

        const codingPayload = {
          source_code,
          language,
          test_cases,
        };

        const testCaseResponse = await axios.post(
          `${process.env.GRADIA_PYTHON_BACKEND_URL}/api/code-eval/submit`,
          codingPayload,
          {
            headers: {
              "x-api-key": process.env.GRADIA_API_KEY,
            },
          }
        );

        const { passed_test_cases, total_test_cases } = testCaseResponse.data;

        const perTestMark = question.maxMarks / total_test_cases;
        const testCaseScore = Math.round(perTestMark * passed_test_cases);

        const codeGradingPayload = {
          question: question.questionText,
          student_code: source_code,
          max_mark: question.maxMarks / 2,
        };
    
        const codeGradingResponse = await axios.post(
          `${process.env.GRADIA_PYTHON_BACKEND_URL}/api/grading/grade-code`,
          codeGradingPayload,
          {
            headers: {
              "x-api-key": process.env.GRADIA_API_KEY,
            },
          }
        );
    
        const { grade: codeScore, feedback: codeFeedback } = codeGradingResponse.data;
    
        if (passed_test_cases === total_test_cases) {
          score = testCaseScore;
        } else {
          const halfScore = question.maxMarks / 2;
          const scaledTestCaseScore = (testCaseScore / question.maxMarks) * halfScore;
          score = Math.round(scaledTestCaseScore + codeScore);
        }
    
        feedback = `${passed_test_cases}/${total_test_cases} test cases passed. Code Feedback: ${codeFeedback}`;
      } catch (err) {
        console.error(`Grading failed for coding question ${ans.questionId}:`, err.message);
      }
    }

    else if (question.type === "handwritten") {
      try {
        const base64Data = ans.fileUrl.split(",")[1]; 
        const imageBuffer = Buffer.from(base64Data, "base64");

        const formData = new FormData();
        formData.append("file", imageBuffer, {
          filename: "handwritten.jpg",
          contentType: "image/jpeg",
        });

        const ocrResponse = await axios.post(
          `${process.env.GRADIA_PYTHON_BACKEND_URL}/api/ocr/extract-text`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              "x-api-key": process.env.GRADIA_API_KEY,
            },
          }
        );

        const extractedText = ocrResponse.data.extracted_text;

        const gradingPayload = {
          question: question.questionText,
          student_answer: extractedText,
          max_mark: question.maxMarks,
          rubric: question.rubric ?? null,
          bucket_name: classId,
        };

        const gradingResponse = await axios.post(
          `${process.env.GRADIA_PYTHON_BACKEND_URL}/api/grading/grade-answer`,
          gradingPayload,
          {
            headers: {
              "x-api-key": process.env.GRADIA_API_KEY,
            },
          }
        );

        const { grade, feedback: fb, reference } = gradingResponse.data;
        score = grade;
        feedback = `${fb}${reference ? ` \nReference: ${reference}` : ""}`;
      } catch (err) {
        console.error(`Grading failed for handwritten question ${ans.questionId}:`, err.message);
      }
    }

    totalScore += score;

    gradedAnswers.push({
      ...ans,
      score,
      feedback,
    });
  }

  submission.answers = gradedAnswers;
  submission.totalScore = totalScore;
  submission.graded = true;

  await submission.save();

  return { message: "Grading complete", submissionId };
};

export const createTest = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacherId = decoded.id;

    const { title, description, startTime, endTime, duration, classAssignment, questions, isDraft, createdBy, rubric } = req.body;
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
      isDraft: isDraft ?? true,
    });

    newTest.maxMarks = questions.reduce((total, question) => total + (question.maxMarks || 0), 0);

    await newTest.save();

    await Class.findByIdAndUpdate(
      classAssignment,
      { $push: { tests: newTest._id } },
      { new: true }
    );

    res.status(201).json({ success: true, message: "Test created successfully!", test: newTest });
  } catch (error) {
    console.error("Error publishing test:", error);
    res.status(500).json({ message: "Failed to publish test", error: error.message });
  }
};

export const getSupportedLanguages = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const response = await fetch(`${process.env.GRADIA_PYTHON_BACKEND_URL}/api/code-eval/get-languages`, {
      headers: {
        "x-api-key": process.env.GRADIA_API_KEY,
      },
    });
    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.status(500).json({ message: 'Invalid response from Judge0 API' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching supported languages:', err);
    return res.status(500).json({ message: 'Something went wrong' });
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

    gradeSubmission(submission._id).catch((err) => {
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

    // console.log('Heatmap data:', heatmapData);
    res.json(heatmapData);
  } catch (error) {
    console.error('Heatmap data error:', error);
    res.status(500).json({ message: 'Error fetching heatmap data', error: error.message });
  }
};