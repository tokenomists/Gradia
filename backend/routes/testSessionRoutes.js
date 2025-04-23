import express from 'express';
import TestSession from '../models/TestSession.js';
import fingerprint from '@fingerprintjs/fingerprintjs';

const router = express.Router();

// ── 1) Start or resume ─────────────────────────────────────────────────────
router.post('/start', async (req, res) => {
  const studentId   = req.user.id;
  if(!studentId) return res.status(401).json({ message: 'Unauthorized, please login and try again.'});
  const { testId } = req.body;
  let session = await TestSession.findOne({ studentId, testId, isSubmitted: false });

  if (!session) {
    const startedAt = Date.now();
    session = await TestSession({ studentId, testId, startedAt, isSubmitted: false });

    await session.save();
  }

  res.status(200).json({ success: true, message: "Test Session successfully created", session: session });
});

// ── 2) Fetch existing ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { studentId, testId } = req.query;
  const session = await TestSession.findOne({ studentId, testId, isSubmitted: false });
  if (!session) return res.status(404).json({ message: 'No active session' });
  res.json(session);
});

// ── 3) Patch progress ──────────────────────────────────────────────────────
router.patch('/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const { answers, currentQuestionIndex } = req.body;
    const session = await TestSession.findById(sessionId);
    if (!session) return res.sendStatus(404);
  
    session.answers = answers;
    session.currentQuestionIndex = currentQuestionIndex;
    session.lastSavedAt = Date.now();
    await session.save();
    res.json({ ok: true });
});

// ── 4) Submit final ────────────────────────────────────────────────────────
router.post('/:sessionId/submit', async (req, res) => {
  // you can reuse your existing submitTest controller here
  await TestSession.findByIdAndUpdate(req.params.sessionId, { isSubmitted: true });
  res.json({ ok: true });
});

export default router;
