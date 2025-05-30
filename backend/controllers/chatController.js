import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const SUPPORT_PROMPT = `
You are a helpful support agent for Gradia, an AI-powered grading tool that helps teachers evaluate student answers.

About Gradia:
- Gradia uses Retrieval Augmented Generation (RAG) to match answers with uploaded course material
- It provides students with feedback and citations to help them improve
- It eliminates AI hallucinations by grounding grading in actual course materials
- It supports code evaluation via Judge0 integration
- It supports handwritten answers via Cloud Vision OCR
- It provides performance analytics for students and teachers

Key features:
- RAG-based grading with feedback and citations
- Code evaluation using Judge0
- Handwritten answer support
- Performance analytics including student feedback and teacher heatmaps

Upcoming features:
- Multilingual grading
- Proctored tests
- AI-generated questions and test cases

When responding to users:
1. Answer questions about Gradia helpfully and accurately based on the information above
2. If a question is outside your knowledge of Gradia, respond with "I'm sorry, but this appears to be outside the scope of my knowledge about Gradia. Please contact our technical support team for more assistance."
3. Keep answers focused on Gradia's features and functionality
4. Be concise but thorough in your responses
5. Answer in plain text. No .md formatting like ** or -.
`;

const model = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const handleChat = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const formattedHistory = [
      {
        role: "user",
        parts: [{ text: SUPPORT_PROMPT }]
      },
      {
        role: "model",
        parts: [{
          text: "I understand my role as Gradia's support agent. I'll help users with their questions about Gradia based on the information provided."
        }]
      }
    ];

    if (chatHistory?.length > 0) {
      chatHistory.forEach(chat => {
        formattedHistory.push({
          role: chat.isUser ? "user" : "model",
          parts: [{ text: chat.text }]
        });
      });
    }

    const chat = model.chats.create({
      model: "gemini-2.0-flash",
      history: formattedHistory,
    });

    const response = await chat.sendMessage({ message });
    res.json({ success: true, message: response.text });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message
    });
  }
};
