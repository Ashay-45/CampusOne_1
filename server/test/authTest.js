// Automated Test Suite for CampusOne Phase 1 Authentication & RBAC
const assert = require('assert');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock environment for test
process.env.JWT_SECRET = 'test_campusone_jwt_secret_key_2026';
process.env.NODE_ENV = 'test';

const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

async function runTests() {
  console.log('🧪 Starting CampusOne Phase 1 Verification Tests...\n');

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

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${e.message}`);
    }
  }

  // 1. Token Generation Test
  test('Token generator creates valid signed JWT with correct payload', () => {
    const token = generateToken('user_123', 'student');
    assert(token && typeof token === 'string', 'Token should be a non-empty string');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.strictEqual(decoded.id, 'user_123', 'Payload ID should match');
    assert.strictEqual(decoded.role, 'student', 'Payload role should match');
  });

  // 2. Token Generator Security Test (Missing Secret)
  test('Token generator throws error if JWT_SECRET is unset', () => {
    const savedSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    assert.throws(() => {
      generateToken('user_123', 'student');
    }, /JWT_SECRET/, 'Should throw when JWT_SECRET is missing');
    process.env.JWT_SECRET = savedSecret;
  });

  // 3. Password Hashing & Verification
  await testAsync('Bcrypt hashing and matching works reliably', async () => {
    const rawPassword = 'StudentSecretPassword123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);
    assert(hash !== rawPassword, 'Hash should not equal raw password');
    const isCorrect = await bcrypt.compare(rawPassword, hash);
    assert.strictEqual(isCorrect, true, 'Correct password should compare true');
    const isWrong = await bcrypt.compare('WrongPassword999', hash);
    assert.strictEqual(isWrong, false, 'Wrong password should compare false');
  });

  // 4. RBAC Authorization Middleware Test (Authorized)
  test('Authorize middleware allows matching roles', () => {
    const middleware = authorize('teacher', 'admin');
    const req = { user: { role: 'teacher' } };
    let nextCalled = false;
    middleware(req, {}, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true, 'Next should be called for authorized role');
  });

  // 5. RBAC Authorization Middleware Test (Forbidden)
  test('Authorize middleware rejects non-matching roles with 403', () => {
    const middleware = authorize('admin');
    const req = { user: { role: 'student' } };
    let statusSet = null;
    let jsonSent = null;
    const res = {
      status: (code) => { statusSet = code; return res; },
      json: (data) => { jsonSent = data; }
    };
    middleware(req, res, () => {});
    assert.strictEqual(statusSet, 403, 'Should respond with 403 Forbidden');
    assert.strictEqual(jsonSent.success, false, 'Success flag should be false');
  });

  // 6. Auth Middleware (Missing Token)
  test('Protect middleware rejects requests without token with 401', () => {
    const req = { headers: {} };
    let statusSet = null;
    let jsonSent = null;
    const res = {
      status: (code) => { statusSet = code; return res; },
      json: (data) => { jsonSent = data; }
    };
    protect(req, res, () => {});
    assert.strictEqual(statusSet, 401, 'Should respond with 401 Unauthorized');
    assert.strictEqual(jsonSent.success, false, 'Success flag should be false');
  });

  // 7. Auth Middleware (Invalid Token)
  test('Protect middleware rejects requests with tampered token with 401', () => {
    const req = { headers: { authorization: 'Bearer invalid.tampered.token' } };
    let statusSet = null;
    let jsonSent = null;
    const res = {
      status: (code) => { statusSet = code; return res; },
      json: (data) => { jsonSent = data; }
    };
    protect(req, res, () => {});
    assert.strictEqual(statusSet, 401, 'Should respond with 401 Unauthorized');
  });

  console.log(`\n===================================`);
  console.log(`Test Results: ${passed}/${total} Passed (${Math.round((passed/total)*100)}%)`);
  console.log(`===================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
