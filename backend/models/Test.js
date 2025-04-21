import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const TestCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 }, // Generate a unique ID for each question
  questionText: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  type: { type: String, enum: ["coding", "typed", "handwritten"], required: true },
  codingLanguage: { type: String, required: function () {return this.type === "coding";}},
  testCases: { type: [TestCaseSchema], default: [] }
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
  isDraft: { type: Boolean, default: true }, // Test is a draft until published
}, { timestamps: true });

export default mongoose.model("Test", TestSchema);
