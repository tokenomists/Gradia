import express from 'express';
import { handleChat } from '../controllers/chatController.js';

const router = express.Router();

router.post('/support', handleChat);

export default router;
