import express from 'express';
import { 
  createClass, 
  getTeacherClasses,
  joinClass,
  getClassDetails
} from '../controllers/classController.js';

const router = express.Router();

// Create a new class (teachers only)
router.post('/create', createClass);

// Get all classes for a teacher
// router.get('/teacher/classes', getTeacherClasses);

// Join a class (students only)
router.post('/join', joinClass);

// Get class details
router.get('/:classId', getClassDetails);

export default router;