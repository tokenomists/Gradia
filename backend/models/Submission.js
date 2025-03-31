import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  answers: [
    {
      questionId: { type: String, required: true }, // Reference Test.questions._id
      questionType: { 
        type: String, 
        enum: ["handwritten", "theoretical", "coding"], 
        required: true 
      },
      answerText: { type: String }, // Used for theoretical answers
      fileUrl: { type: String }, // Used for handwritten answers
      codeAnswer: { type: String }, // Used for coding answers
    }
  ],
  totalScore: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  graded: { type: Boolean, default: false },
  feedback: { type: String, default: "" },
}, { timestamps: true });

const Submission = mongoose.model("Submission", SubmissionSchema);
export default Submission;
