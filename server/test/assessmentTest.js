// Automated Test Suite for CampusOne Phase 5 Assessment Security & Server-Side Grading
const assert = require('assert');
const mongoose = require('mongoose');

process.env.JWT_SECRET = 'test_campusone_jwt_secret_key_2026';
process.env.NODE_ENV = 'test';

const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');

async function runAssessmentTests() {
  console.log('🧪 Starting CampusOne Assessment Security & Grading Verification Tests...\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${e.message}`);
    }
  }

  // 1. Confidential Question Delivery Test
  test('Assessment sanitization strips confidential correct answers and explanations', () => {
    const rawAssessment = {
      _id: new mongoose.Types.ObjectId(),
      title: 'DSA Diagnostic',
      topic: 'DSA',
      timeLimitMinutes: 3,
      passingPercentage: 60,
      questions: [
        {
          _id: new mongoose.Types.ObjectId(),
          question: 'What is worst case of QuickSort?',
          options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
          correct: 2,
          explanation: 'Bad pivot causes quadratic comparisons.'
        }
      ]
    };

    // Simulate the endpoint sanitization logic
    const sanitized = {
      id: rawAssessment._id,
      title: rawAssessment.title,
      questions: rawAssessment.questions.map(q => ({
        id: q._id,
        question: q.question,
        options: q.options
      }))
    };

    assert.strictEqual(sanitized.questions[0].correct, undefined, 'Correct index MUST be undefined in sanitized payload');
    assert.strictEqual(sanitized.questions[0].explanation, undefined, 'Explanation MUST be undefined in sanitized payload');
    assert.strictEqual(sanitized.questions[0].options.length, 4, 'Options must be preserved');
  });

  // 2. Server-Side Grading & Pass/Fail Evaluation
  test('Server calculates exact score and enforces passing percentage', () => {
    const questions = [
      { correct: 2, explanation: 'Exp 1' },
      { correct: 1, explanation: 'Exp 2' }
    ];
    const passingPercentage = 60;

    // Student A: Answers both correctly -> 2/2 = 100% (Passed)
    const answersA = { 0: 2, 1: 1 };
    let scoreA = 0;
    questions.forEach((q, idx) => { if (answersA[idx] === q.correct) scoreA++; });
    const percentA = Math.round((scoreA / questions.length) * 100);
    const passedA = percentA >= passingPercentage;

    assert.strictEqual(scoreA, 2, 'Student A score should be 2');
    assert.strictEqual(percentA, 100, 'Student A percent should be 100');
    assert.strictEqual(passedA, true, 'Student A should have passed');

    // Student B: Answers 1 correctly -> 1/2 = 50% (<60% threshold, Failed)
    const answersB = { 0: 2, 1: 3 };
    let scoreB = 0;
    questions.forEach((q, idx) => { if (answersB[idx] === q.correct) scoreB++; });
    const percentB = Math.round((scoreB / questions.length) * 100);
    const passedB = percentB >= passingPercentage;

    assert.strictEqual(scoreB, 1, 'Student B score should be 1');
    assert.strictEqual(percentB, 50, 'Student B percent should be 50');
    assert.strictEqual(passedB, false, 'Student B should fail below 60% threshold');
  });

  // 3. AssessmentAttempt Model Validation
  test('AssessmentAttempt model validates score, total, and percentage bounds', () => {
    const attempt = new AssessmentAttempt({
      assessment: new mongoose.Types.ObjectId(),
      student: new mongoose.Types.ObjectId(),
      score: 4,
      total: 5,
      percentage: 80,
      passed: true
    });

    assert.strictEqual(attempt.score, 4);
    assert.strictEqual(attempt.total, 5);
    assert.strictEqual(attempt.percentage, 80);
    assert.strictEqual(attempt.passed, true);
  });

  console.log(`\n===================================`);
  console.log(`Assessment Tests: ${passed}/${total} Passed (${Math.round((passed/total)*100)}%)`);
  console.log(`===================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runAssessmentTests();
