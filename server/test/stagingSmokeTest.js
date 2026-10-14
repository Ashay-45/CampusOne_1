// CampusOne Staging Deployment 15-Point Automated Smoke Test Suite
// Executes against live staging target or local staging simulation
const assert = require('assert');
const http = require('http');
const https = require('https');

const TARGET_API_URL = process.env.STAGING_API_URL || 'http://127.0.0.1:5000/api/v1';

async function request(endpoint, options = {}) {
  const url = new URL(endpoint.startsWith('http') ? endpoint : `${TARGET_API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`);
  const client = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const reqOpts = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {})
      }
    };

    if (options.body && options.method !== 'GET') {
      reqOpts.headers['Content-Type'] = 'application/json';
    }

    const req = client.request(reqOpts, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let body = null;
        try { body = JSON.parse(data); } catch (_) { body = data; }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });

    req.on('error', reject);

    if (options.body && options.method !== 'GET') {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runStagingSmokeTests(inProcessApp = null) {
  console.log(`\n🚀 Executing 15-Point Staging Deployment Smoke Test Suite...`);
  console.log(`Target API: ${inProcessApp ? 'In-Process Staging Test Server' : TARGET_API_URL}\n`);

  let serverInstance = null;
  let baseUrl = TARGET_API_URL;

  if (inProcessApp) {
    await new Promise((resolve) => {
      serverInstance = http.createServer(inProcessApp);
      serverInstance.listen(0, '127.0.0.1', () => {
        const port = serverInstance.address().port;
        baseUrl = `http://127.0.0.1:${port}/api/v1`;
        resolve();
      });
    });
  }

  const smokeReq = (endpoint, opts) => {
    const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    return request(fullUrl, opts);
  };

  let passed = 0;
  let total = 0;

  async function test(num, name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [SMOKE-${String(num).padStart(2, '0')}] PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ [SMOKE-${String(num).padStart(2, '0')}] FAIL: ${name}`);
      console.error(`     Error: ${e.message}`);
    }
  }

  // Shared test context
  let studentToken = null;
  let studentUser = null;
  let teacherToken = null;
  let adminToken = null;
  let createdAssessmentId = null;
  let submittedAttemptId = null;
  const uniqueSuffix = Date.now();

  try {
    // 1. Frontend / Health Root Responds
    await test(1, 'Backend service liveness endpoint responds', async () => {
      const res = await smokeReq('/health', { method: 'GET' });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.status, 'ok');
      assert.strictEqual(res.body.service, 'CampusOne API');
    });

    // 2. Health Endpoint Payload Verification
    await test(2, 'Backend health returns version, environment, and timestamp', async () => {
      const res = await smokeReq('/health', { method: 'GET' });
      assert(res.body.version, 'Version must be present');
      assert(res.body.environment, 'Environment must be present');
      assert(res.headers['x-request-id'], 'X-Request-Id must be present');
    });

    // 3. Database Readiness Check
    await test(3, 'Database readiness probe reports connectivity status', async () => {
      const res = await smokeReq('/health/ready', { method: 'GET' });
      // In staging with live Atlas, returns 200 ready; in test mock, handles disconnected gracefully
      assert([200, 503].includes(res.statusCode), 'Must return 200 (ready) or 503 (database disconnected)');
    });

    // 4. Student Registration Works
    await test(4, 'Student registration registers account and returns signed JWT', async () => {
      const res = await smokeReq('/auth/register', {
        method: 'POST',
        body: {
          name: 'Synthetic Staging Student',
          email: `staging.student.${uniqueSuffix}@campusone.edu`,
          password: 'StagingSecretPassword123!',
          role: 'student'
        }
      });
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert(res.body.token, 'Token must be issued');
      studentToken = res.body.token;
      studentUser = res.body.user;
    });

    // 5. Student Login Works
    await test(5, 'Student login verifies credentials and issues valid token', async () => {
      const res = await smokeReq('/auth/login', {
        method: 'POST',
        body: {
          email: `staging.student.${uniqueSuffix}@campusone.edu`,
          password: 'StagingSecretPassword123!'
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert(res.body.token, 'Token must be returned on login');
    });

    // 6. Session Recovery Works (GET /auth/me)
    await test(6, 'Session recovery endpoint validates active JWT token', async () => {
      const res = await smokeReq('/auth/me', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.user.email, `staging.student.${uniqueSuffix}@campusone.edu`);
      assert.strictEqual(res.body.user.role, 'student');
    });

    // 7. Student Dashboard Loads Real Data
    await test(7, 'Student profile endpoint retrieves academic and timetable metrics', async () => {
      const res = await smokeReq('/academics/student-profile', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert(typeof res.body.profile.attendanceRate === 'number');
      assert(Array.isArray(res.body.profile.timetable));
    });

    // Authenticate seeded teacher user for teacher workflows
    const teacherLoginRes = await smokeReq('/auth/login', {
      method: 'POST',
      body: {
        email: 'priya.raman@campusone.edu',
        password: 'Campus@2024'
      }
    });
    if (teacherLoginRes.statusCode === 200) {
      teacherToken = teacherLoginRes.body.token;
    }

    // 8. Teacher Attendance Recording Works
    await test(8, 'Teacher marks session attendance for course', async () => {
      if (!teacherToken) {
        throw new Error('Teacher provisioning required');
      }
      const res = await smokeReq('/academics/attendance/mark', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${teacherToken}` },
        body: {
          subjectCode: 'CS-601',
          batch: 'CS-6A',
          topic: 'Staging Smoke Test Verification Lecture',
          records: [
            { studentId: studentUser.id, status: 'present' }
          ]
        }
      });
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.summary.present, 1);
    });

    // 9. Attendance Calculations Update Correctly
    await test(9, 'Student profile recomputes dynamic attendance after marking', async () => {
      const res = await smokeReq('/academics/student-profile', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert(res.body.profile.totalClasses >= 1);
    });

    // 10. Assessment Creation Works
    await test(10, 'Teacher creates new assessment diagnostic', async () => {
      const res = await smokeReq('/tests/create', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${teacherToken}` },
        body: {
          title: `Staging Verification Quiz ${uniqueSuffix}`,
          topic: 'DSA',
          timeLimitMinutes: 5,
          passingPercentage: 60,
          questions: [
            {
              question: 'What is the time complexity of lookup in a balanced binary search tree?',
              options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
              correct: 1,
              explanation: 'A balanced BST divides search space in half at each step, yielding O(log n).'
            }
          ]
        }
      });
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      createdAssessmentId = res.body.assessment.id;
    });

    // 11. Student Assessment Submission Works
    await test(11, 'Student submits answers and server computes authoritative grade', async () => {
      const res = await smokeReq('/tests/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${studentToken}` },
        body: {
          assessmentId: createdAssessmentId,
          answers: { 0: 1 }, // Correct choice
          timeSpentSeconds: 45
        }
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.result.score, 1);
      assert.strictEqual(res.body.result.passed, true);
      submittedAttemptId = res.body.result.attemptId;
    });

    // 12. Results Persist Correctly
    await test(12, 'Assessment attempt result retrieves saved grade and review', async () => {
      const res = await smokeReq(`/tests/results/${submittedAttemptId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.attempt.score, 1);
    });

    // 13. Unauthorized Result Access Rejected (Owner Isolation)
    await test(13, 'Cross-student result access is blocked with HTTP 403', async () => {
      // Register second student
      const studentBReg = await smokeReq('/auth/register', {
        method: 'POST',
        body: {
          name: 'Student B',
          email: `student.b.${uniqueSuffix}@campusone.edu`,
          password: 'Password123!',
          role: 'student'
        }
      });
      const studentBToken = studentBReg.body.token;

      // Student B attempts to fetch Student A's result
      const res = await smokeReq(`/tests/results/${submittedAttemptId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${studentBToken}` }
      });
      assert.strictEqual(res.statusCode, 403, 'Cross-student snooping must be rejected with 403');
      assert.strictEqual(res.body.success, false);
    });

    // Authenticate seeded Admin for admin testing
    const adminLoginRes = await smokeReq('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@campusone.edu',
        password: 'Campus@2024'
      }
    });
    if (adminLoginRes.statusCode === 200) {
      adminToken = adminLoginRes.body.token;
    }

    // 14. Administrator Permissions Work
    await test(14, 'Admin lists registered institution users', async () => {
      const res = await smokeReq('/admin/users', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert(Array.isArray(res.body.users));
    });

    // 15. Logout Works
    await test(15, 'Session logout endpoint terminates active session', async () => {
      const res = await smokeReq('/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
    });

  } finally {
    if (serverInstance) {
      await new Promise(r => serverInstance.close(r));
    }
  }

  console.log(`\n=================================================`);
  console.log(`Staging Smoke Test Results: ${passed}/${total} Passed (${Math.round((passed/total)*100)}%)`);
  console.log(`=================================================\n`);

  if (passed !== total) {
    process.exit(1);
  } else if (require.main === module) {
    process.exit(0);
  }
}

// Support running standalone: node test/stagingSmokeTest.js
if (require.main === module) {
  // If no STAGING_API_URL provided, run against in-process app instance with live DB
  if (!process.env.STAGING_API_URL) {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_campusone_jwt_secret_key_2026';
    process.env.NODE_ENV = 'staging';
    const app = require('../server');
    runStagingSmokeTests(app);
  } else {
    runStagingSmokeTests();
  }
}

module.exports = { runStagingSmokeTests };
