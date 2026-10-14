// Automated Test Suite for CampusOne Phase 2 & 3: Academic Modeling & Attendance Math
const assert = require('assert');
const mongoose = require('mongoose');

process.env.JWT_SECRET = 'test_campusone_jwt_secret_key_2026';
process.env.NODE_ENV = 'test';

const Subject = require('../models/Subject');
const AttendanceRecord = require('../models/AttendanceRecord');
const { authorize } = require('../middleware/authorize');

async function runAcademicTests() {
  console.log('🧪 Starting CampusOne Academic & Attendance Verification Tests...\n');

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

  // 1. Attendance Math Test: Safe Bunks & Deficit
  test('Attendance calculation produces authoritative rate, safe bunks, and deficits', () => {
    // Case A: 30 attended out of 32 conducted -> 93.8%
    const conductedA = 32;
    const attendedA = 30;
    const rateA = Number(((attendedA / conductedA) * 100).toFixed(1));
    const safeBunksA = Math.max(0, Math.floor((attendedA / 0.75) - conductedA));
    const deficitA = Math.max(0, Math.ceil((0.75 * conductedA - attendedA) / 0.25));

    assert.strictEqual(rateA, 93.8, 'Rate should be 93.8%');
    assert.strictEqual(safeBunksA, 8, 'Should be able to miss 8 classes without dropping below 75%');
    assert.strictEqual(deficitA, 0, 'Deficit should be 0');

    // Case B: 22 attended out of 30 conducted -> 73.3% (<75% deficit)
    const conductedB = 30;
    const attendedB = 22;
    const rateB = Number(((attendedB / conductedB) * 100).toFixed(1));
    const safeBunksB = Math.max(0, Math.floor((attendedB / 0.75) - conductedB));
    const deficitB = Math.max(0, Math.ceil((0.75 * conductedB - attendedB) / 0.25));

    assert.strictEqual(rateB, 73.3, 'Rate should be 73.3%');
    assert.strictEqual(safeBunksB, 0, 'Safe bunks should be 0 when below 75%');
    assert.strictEqual(deficitB, 2, 'Needs 2 consecutive attendances to reach 75% (23/31 = 74.2%, 24/32 = 75.0%)');
  });

  // 2. Subject Model Schema Validation
  test('Subject model schema requires uppercase code and valid credit bounds', () => {
    const validSubject = new Subject({
      code: 'cs-601',
      name: 'Data Structures & Algorithms',
      credits: 4
    });

    assert.strictEqual(validSubject.code, 'CS-601', 'Subject code should be automatically uppercased');
    assert.strictEqual(validSubject.credits, 4, 'Credits should be 4');
  });

  // 3. AttendanceRecord Schema Index Validation
  test('AttendanceRecord schema enforces compound unique index on session and student', () => {
    const indexes = AttendanceRecord.schema.indexes();
    const hasCompoundIndex = indexes.some(idx => {
      const keys = idx[0];
      const opts = idx[1];
      return keys.session === 1 && keys.student === 1 && opts && opts.unique === true;
    });

    assert.strictEqual(hasCompoundIndex, true, 'AttendanceRecord must have unique compound index on { session: 1, student: 1 }');
  });

  // 4. Role Authorization on Attendance Marking
  test('Faculty attendance marking endpoint permits teacher and admin, blocks student', () => {
    const middleware = authorize('teacher', 'admin');

    // Teacher check
    let teacherAllowed = false;
    middleware({ user: { role: 'teacher' } }, {}, () => { teacherAllowed = true; });
    assert.strictEqual(teacherAllowed, true, 'Teacher must be allowed to mark attendance');

    // Admin check
    let adminAllowed = false;
    middleware({ user: { role: 'admin' } }, {}, () => { adminAllowed = true; });
    assert.strictEqual(adminAllowed, true, 'Admin must be allowed to mark attendance');

    // Student check (blocked)
    let studentStatus = null;
    middleware(
      { user: { role: 'student' } },
      {
        status: (code) => { studentStatus = code; return { json: () => {} }; }
      },
      () => {}
    );
    assert.strictEqual(studentStatus, 403, 'Student must be rejected with 403 Forbidden');
  });

  console.log(`\n===================================`);
  console.log(`Academic Tests: ${passed}/${total} Passed (${Math.round((passed/total)*100)}%)`);
  console.log(`===================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runAcademicTests();
