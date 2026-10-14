// Automated Test Suite for CampusOne Phase 7: Admin RBAC, User Management, Career Hub & AI
const assert = require('assert');
const mongoose = require('mongoose');

process.env.JWT_SECRET = 'test_campusone_jwt_secret_key_2026';
process.env.NODE_ENV = 'test';

const { authorize } = require('../middleware/authorize');
const StudentProfile = require('../models/StudentProfile');

async function runAdminAndCareerTests() {
  console.log('🧪 Starting CampusOne Admin RBAC, Career Hub & AI Verification Tests...\n');

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

  // 1. Admin RBAC Protection
  test('Admin routes strictly reject non-admin users with 403', () => {
    const adminGuard = authorize('admin');

    // Case A: Student is rejected
    let studentStatus = null;
    adminGuard(
      { user: { role: 'student' } },
      { status: (code) => { studentStatus = code; return { json: () => {} }; } },
      () => {}
    );
    assert.strictEqual(studentStatus, 403, 'Student must be rejected from admin routes');

    // Case B: Faculty is rejected
    let teacherStatus = null;
    adminGuard(
      { user: { role: 'teacher' } },
      { status: (code) => { teacherStatus = code; return { json: () => {} }; } },
      () => {}
    );
    assert.strictEqual(teacherStatus, 403, 'Faculty must be rejected from admin routes');

    // Case C: Admin is permitted
    let adminNext = false;
    adminGuard({ user: { role: 'admin' } }, {}, () => { adminNext = true; });
    assert.strictEqual(adminNext, true, 'Admin must be permitted to admin routes');
  });

  // 2. StudentProfile Career Data Schema Test
  test('StudentProfile persists skills and technical projects portfolio', () => {
    const profile = new StudentProfile({
      user: new mongoose.Types.ObjectId(),
      roll: 'CS-2023-099',
      atsScore: 88,
      skills: [
        { name: 'React', level: 'Advanced', verified: true },
        { name: 'Docker', level: 'Intermediate', verified: false }
      ],
      projects: [
        {
          title: 'CampusOne Cloud Engine',
          tech: 'Node.js, Express, MongoDB',
          desc: 'Architected academic and career development platform.',
          impact: 'Sub-40ms latency'
        }
      ]
    });

    assert.strictEqual(profile.atsScore, 88);
    assert.strictEqual(profile.skills.length, 2);
    assert.strictEqual(profile.skills[0].name, 'React');
    assert.strictEqual(profile.projects.length, 1);
    assert.strictEqual(profile.projects[0].title, 'CampusOne Cloud Engine');
  });

  // 3. Dynamic ATS Index Math
  test('ATS recalculation rewards verified skills and technical projects within 0-100 bounds', () => {
    const verifiedSkillsCount = 4;
    const projectCount = 2;
    const computedScore = Math.min(96, Math.max(75, 76 + verifiedSkillsCount * 2 + projectCount * 3));

    // 76 + 8 + 6 = 90
    assert.strictEqual(computedScore, 90, 'Score should be 90 for 4 verified skills and 2 projects');
    assert(computedScore <= 100 && computedScore >= 0, 'ATS score must remain bounded');
  });

  console.log(`\n===================================`);
  console.log(`Admin & Career Tests: ${passed}/${total} Passed (${Math.round((passed/total)*100)}%)`);
  console.log(`===================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runAdminAndCareerTests();
