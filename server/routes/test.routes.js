const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const catData = require('../utils/catData');

// Seed catalog of default assessments if database is empty
const defaultAssessments = [
  {
    title: 'Data Structures & Algorithms Diagnostic',
    topic: 'DSA',
    description: 'Algorithmic time complexity, graph traversal, and queue properties.',
    timeLimitMinutes: 3,
    passingPercentage: 60,
    questions: [
      {
        question: 'What is the worst-case time complexity of QuickSort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correct: 2,
        explanation: 'QuickSort exhibits O(n²) worst-case time when bad pivots are chosen (e.g. already sorted array with leftmost pivot).'
      },
      {
        question: 'Which data structure is naturally used for Breadth First Search (BFS)?',
        options: ['Stack', 'Queue', 'Priority Queue', 'Binary Tree'],
        correct: 1,
        explanation: 'BFS explores vertices level by level, requiring FIFO order provided by a Queue.'
      }
    ]
  },
  {
    title: 'Database Management Systems Foundations',
    topic: 'DBMS',
    description: 'Relational normalization rules, functional dependencies, and ACID transaction properties.',
    timeLimitMinutes: 3,
    passingPercentage: 60,
    questions: [
      {
        question: 'Which normal form eliminates transitive functional dependencies?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correct: 2,
        explanation: '3NF requires that no non-prime attribute is transitively dependent on the primary key.'
      },
      {
        question: 'In ACID properties of transactions, what does the "I" stand for?',
        options: ['Index', 'Isolation', 'Integrity', 'Immutability'],
        correct: 1,
        explanation: 'Isolation ensures concurrent transaction execution produces state equivalent to serial execution.'
      }
    ]
  },
  {
    title: 'Machine Learning & Deep Learning Core',
    topic: 'AI/ML',
    description: 'Neural activation functions and optimization hazards.',
    timeLimitMinutes: 2,
    passingPercentage: 60,
    questions: [
      {
        question: 'Which activation function is most susceptible to the vanishing gradient problem in deep networks?',
        options: ['ReLU', 'Leaky ReLU', 'Sigmoid', 'ELU'],
        correct: 2,
        explanation: 'Sigmoid has derivatives bounded between 0 and 0.25, causing backpropagated gradients to vanish rapidly in deep networks.'
      }
    ]
  }
];

// Ensure assessments exist
async function ensureAssessments() {
  const count = await Assessment.countDocuments();
  if (count === 0) {
    await Assessment.insertMany(defaultAssessments);
  }
}

// @route   GET /api/v1/tests/topics
// @desc    Get topic catalog from catData
// @access  Public
router.get('/topics', (req, res) => {
  res.status(200).json({
    success: true,
    catalog: catData
  });
});

// @route   GET /api/v1/tests/active
// @desc    Get assessments without confidential correct answers
// @access  Public or Protected
router.get('/active', async (req, res) => {
  try {
    await ensureAssessments();
    const { topic } = req.query;
    const filter = { isActive: true };
    if (topic && topic !== 'ALL') {
      filter.topic = topic;
    }

    const assessments = await Assessment.find(filter);

    // SECURITY: Strip 'correct' and 'explanation' fields
    const sanitizedAssessments = assessments.map(a => ({
      id: a._id,
      title: a.title,
      topic: a.topic,
      description: a.description,
      timeLimitMinutes: a.timeLimitMinutes,
      passingPercentage: a.passingPercentage,
      questionCount: a.questions.length,
      questions: a.questions.map((q, idx) => ({
        id: q._id || idx,
        question: q.question,
        options: q.options
      }))
    }));

    res.status(200).json({
      success: true,
      assessments: sanitizedAssessments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/v1/tests/create
// @desc    Faculty or Admin creates a new assessment (draft or published)
// @access  Protected (Teacher, Admin)
router.post('/create', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, topic = 'ALL', description = '', timeLimitMinutes = 5, passingPercentage = 60, questions, isActive = true } = req.body;
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Title and at least one question are required.' });
    }

    const assessment = await Assessment.create({
      title,
      topic,
      description,
      timeLimitMinutes,
      passingPercentage,
      questions,
      isActive
    });

    res.status(201).json({
      success: true,
      message: `Assessment "${assessment.title}" created successfully.`,
      assessment: {
        id: assessment._id,
        title: assessment.title,
        topic: assessment.topic,
        timeLimitMinutes: assessment.timeLimitMinutes,
        passingPercentage: assessment.passingPercentage,
        isActive: assessment.isActive,
        questionCount: assessment.questions.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PATCH /api/v1/tests/:id/publish
// @desc    Faculty or Admin toggles publish status (draft vs published)
// @access  Protected (Teacher, Admin)
router.patch('/:id/publish', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    assessment.isActive = !assessment.isActive;
    await assessment.save();

    res.status(200).json({
      success: true,
      message: `Assessment status updated to ${assessment.isActive ? 'published' : 'draft'}.`,
      isActive: assessment.isActive
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/v1/tests/submit
// @desc    Server-side assessment grading, answer validation, and attempt persistence
// @access  Protected
router.post('/submit', protect, async (req, res) => {
  try {
    const { assessmentId, answers = {}, timeSpentSeconds = 0 } = req.body;

    if (!assessmentId) {
      return res.status(400).json({ success: false, message: 'assessmentId is required' });
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    if (!assessment.isActive) {
      return res.status(400).json({ success: false, message: 'Assessment is currently inactive or in draft state.' });
    }

    // Server-side timing enforcement: allow up to 60 seconds grace period for network latency
    const maxAllowedSeconds = (assessment.timeLimitMinutes * 60) + 60;
    if (timeSpentSeconds > maxAllowedSeconds) {
      return res.status(400).json({
        success: false,
        message: `Assessment attempt expired. Time spent (${timeSpentSeconds}s) exceeded limit of ${assessment.timeLimitMinutes} minutes.`
      });
    }

    let score = 0;
    const review = [];

    // Evaluate answers strictly on server
    assessment.questions.forEach((q, idx) => {
      const qKey = q._id ? q._id.toString() : String(idx);
      const studentAnswer = answers[qKey] !== undefined ? Number(answers[qKey]) : answers[idx] !== undefined ? Number(answers[idx]) : null;

      const isCorrect = studentAnswer === q.correct;
      if (isCorrect) score++;

      review.push({
        questionIndex: idx,
        question: q.question,
        options: q.options,
        studentAnswer,
        correctAnswer: q.correct,
        isCorrect,
        explanation: q.explanation
      });
    });

    const total = assessment.questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= assessment.passingPercentage;

    // Persist attempt to MongoDB
    const attempt = await AssessmentAttempt.create({
      assessment: assessment._id,
      student: req.user._id,
      score,
      total,
      percentage,
      passed,
      answers,
      timeSpentSeconds
    });

    res.status(200).json({
      success: true,
      result: {
        attemptId: attempt._id,
        assessmentTitle: assessment.title,
        topic: assessment.topic,
        score,
        total,
        percentage,
        passed,
        passingPercentage: assessment.passingPercentage,
        timeSpentSeconds,
        review
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/v1/tests/results/:attemptId
// @desc    Get detailed review for an attempt with strict authorization check
// @access  Protected (Attempt owner, Teacher, Admin)
router.get('/results/:attemptId', protect, async (req, res) => {
  try {
    const attempt = await AssessmentAttempt.findById(req.params.attemptId).populate('assessment', 'title topic passingPercentage');
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found.' });
    }

    // STRICT DATA OWNERSHIP: Students cannot view other students' attempts
    if (req.user.role === 'student' && attempt.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to view another student\'s attempt result.'
      });
    }

    res.status(200).json({
      success: true,
      attempt
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/v1/tests/history
// @desc    Get student previous assessment attempts
// @access  Protected
router.get('/history', protect, async (req, res) => {
  try {
    const attempts = await AssessmentAttempt.find({ student: req.user._id })
      .populate('assessment', 'title topic')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      attempts: attempts.map(att => ({
        id: att._id,
        title: att.assessment?.title || 'Course Diagnostic',
        topic: att.assessment?.topic || 'DSA',
        score: `${att.score} / ${att.total}`,
        percentage: `${att.percentage}%`,
        passed: att.passed,
        date: att.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
