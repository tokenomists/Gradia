import mongoose from "mongoose";

const TestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  classAssignment: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  questions: [
    {
      questionText: { type: String, required: true },
      maxMarks: { type: Number, required: true },
      type: { type: String, enum: ["coding", "theoretical", "handwritten"], required: true },
      options: { type: [String] }, // Only for MCQs
      correctAnswer: { type: String }, // Only for MCQs
    }
  ],
  rubric: {
    type: {
      title: { type: String, default: "" },
      criteria: [
        {
          name: { type: String, required: true },
          weight: { type: Number, required: true }
        }
      ]
    },
    default: undefined
  }, files: {
    type: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true }
      }
    ],
    default: [] // ✅ Defaults to an empty array if no files are uploaded
  },
  isDraft: { type: Boolean, default: true }, // Test is a draft until published
}, { timestamps: true });

export default mongoose.model("Test", TestSchema);
