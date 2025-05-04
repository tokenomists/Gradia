import fs from "fs";
import express from 'express';
import multer from "multer";

import { 
  createClass, 
  joinClass,
  getClassDetails,
  getClassMaterials,
  deleteClassMaterial,
  uploadClassMaterial,
  downloadClassMaterial
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

router.post('/create', upload.array('classFiles'), createClass);
router.post('/join', joinClass);
router.get('/:classId', getClassDetails);
router.post('/get-class-materials', getClassMaterials);
router.post('/upload-class-material', upload.array('classFiles'), uploadClassMaterial);
router.post('/delete-class-material', deleteClassMaterial);
router.post('/download-class-material', downloadClassMaterial);

export default router;