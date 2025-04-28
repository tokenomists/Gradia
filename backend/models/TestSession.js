import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const TestSessionSchema = new mongoose.Schema({
  _id:           { type: String, default: uuidv4 },
  studentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  testId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Test',    required: true },
  startedAt:     { type: Date},
  lastSavedAt:   { type: Date},
  currentQuestionIndex: { type: Number, default: 0 },
  answers:       { type: Array,  default: [] },
  isSubmitted:   { type: Boolean, default: false },
  isStarted:     { type: Boolean, default: false },
  deviceFingerprint: { type: String }
}, { timestamps: true });

export default mongoose.model('TestSession', TestSessionSchema);
