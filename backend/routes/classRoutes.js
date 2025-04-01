import fs from "fs";
import express from 'express';
import multer from "multer";

import { 
  createClass, 
  getTeacherClasses,
  joinClass,
  getClassDetails
} from '../controllers/classController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

// Create a new class (teachers only)
router.post('/create', upload.array('classFiles'), createClass);

// Get all classes for a teacher
// router.get('/teacher/classes', getTeacherClasses);

// Join a class (students only)
router.post('/join', joinClass);

// Get class details
router.get('/:classId', getClassDetails);

export default router;