import TestSession from "../models/TestSession.js";

export const startTestSession = async (req, res) => {
  const studentId = req.user.id;
  if (!studentId) {
    return res.status(401).json({ message: "Unauthorized, please login and try again." });
  }

  const { testId } = req.body;
  let session = await TestSession.findOne({ studentId, testId, isSubmitted: false });

  if (!session) {
    session = new TestSession({ studentId, testId, isSubmitted: false });
    await session.save();
  }

  if (!session) {
    return res.status(500).json({ success: false, message: "Failed to create test session" });
  }

  res.status(200).json({ success: true, message: "Test Session successfully created", session });
};

export const getTestSession = async (req, res) => {
  const studentId = req.user.id;
  if (!studentId) {
    return res.status(401).json({ message: "Unauthorized, please login and try again." });
  }

  const { testId } = req.params;
  const session = await TestSession.findOne({ studentId, testId, isSubmitted: false });

  res.json({
    success: true,
    data: session ? { isStarted: true, session } : { isStarted: false, session: null }
  });
};

export const updateTestSession = async (req, res) => {
  const { sessionId } = req.params;
  const { answers, currentQuestionIndex } = req.body;

  const session = await TestSession.findById(sessionId);
  if (!session) return res.sendStatus(404);

  session.answers = answers;
  session.currentQuestionIndex = currentQuestionIndex;
  session.lastSavedAt = Date.now();
  session.isStarted = true;
  await session.save();

  res.json({ ok: true });
};

export const markTestSessionStarted = async (req, res) => {
  const { sessionId } = req.params;

  const session = await TestSession.findById(sessionId);
  if (!session) return res.sendStatus(404);

  session.startedAt = Date.now();
  session.isStarted = true;
  await session.save();

  res.json({ success: true });
};

export const submitTestSession = async (req, res) => {
  await TestSession.findByIdAndDelete(req.params.sessionId);
  res.json({ ok: true });
};
