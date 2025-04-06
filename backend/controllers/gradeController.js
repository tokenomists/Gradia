import axios from "axios";
import Test from "../models/Test.js";
import Submission from "../models/Submission.js";

export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const test = await Test.findById(submission.test);
    if (!test) return res.status(404).json({ message: "Test not found" });

    const classId = test.classAssignment;
    let totalScore = 0;
    const gradedAnswers = [];

    for (const ans of submission.answers) {
      const question = test.questions.find(q => q._id.toString() === ans.questionId);
      if (!question) continue;

      let score = 0;
      let feedback = "";

      // Grading for typed questions
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

      // Grading for coding questions
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

          const response = await axios.post(
            `${process.env.GRADIA_PYTHON_BACKEND_URL}/submit-code`,
            codingPayload,
            {
              headers: {
                "x-api-key": process.env.GRADIA_API_KEY,
              },
            }
          );

          const { passed_test_cases, total_test_cases } = response.data;

          const perTestMark = question.maxMarks / total_test_cases;
          score = Math.round(perTestMark * passed_test_cases);
          feedback = `${passed_test_cases}/${total_test_cases} test cases passed.`;
        } catch (err) {
          console.error(`Grading failed for coding question ${ans.questionId}:`, err.message);
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

    res.status(200).json({ message: "Grading complete", submissionId });

  } catch (error) {
    console.error("Error in grading:", error);
    res.status(500).json({ message: "Error in grading", error: error.message });
  }
};
