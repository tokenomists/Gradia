import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const QuestionSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 }, // Generate a unique ID for each question
  questionText: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  type: { type: String, enum: ["coding", "typed", "handwritten"], required: true },
  codingLanguage: { type: String, enum: ["python", "javascript"] },
});

const TestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  classAssignment: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  questions: [QuestionSchema],
  maxMarks: { type: Number, required: true, default: 0 },
  files: {
    type: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true }
      }
    ],
    default: [] // Defaults to an empty array if no files are uploaded
  },
  isDraft: { type: Boolean, default: true }, // Test is a draft until published
}, { timestamps: true });

export default mongoose.model("Test", TestSchema);
