// Security Hardening, CORS, Rate Limiting & Staging Readiness Test Suite
const assert = require('assert');
const http = require('http');

process.env.JWT_SECRET = 'test_campusone_jwt_secret_key_2026';
process.env.MONGO_URI = 'mongodb://localhost:27017/campusone_test';
process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'http://localhost:5173,https://staging.campusone.edu';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_AUTH_MAX = '5'; // Low threshold for deterministic rate-limit testing

const User = require('../models/User');
// Mock database queries so tests execute instantly in test isolation without waiting for remote DB
User.findOne = () => Promise.resolve(null);
User.create = (data) => Promise.resolve({ ...data, _id: 'mock_test_id_123' });

const app = require('../server');

async function runSecurityAndStagingTests() {
  console.log('🧪 Starting CampusOne Security Hardening & Staging Readiness Tests...\n');

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

  // Helper function to dispatch lightweight mock HTTP requests to express app
  function makeRequest(app, options = {}) {
    return new Promise((resolve, reject) => {
      const server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        const reqOpts = {
          host: '127.0.0.1',
          port,
          path: options.path || '/',
          method: options.method || 'GET',
          headers: options.headers || {}
        };

        const req = http.request(reqOpts, (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            server.close(() => {
              let parsedBody = null;
              try { parsedBody = JSON.parse(data); } catch (_) { parsedBody = data; }
              resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                body: parsedBody
              });
            });
          });
        });

        req.on('error', (err) => {
          server.close(() => reject(err));
        });

        if (options.body) {
          req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
      });
    });
  }

  // 1. Health Liveness Probe Test
  await testAsync('Liveness probe GET /api/v1/health returns 200 with service status', async () => {
    const res = await makeRequest(app, { path: '/api/v1/health' });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.service, 'CampusOne API');
    assert(res.body.timestamp, 'Timestamp must be present');
  });

  // 2. Request Correlation ID Propagation Test
  await testAsync('Server generates and attaches X-Request-Id header to responses', async () => {
    const res = await makeRequest(app, { path: '/api/v1/health' });
    assert(res.headers['x-request-id'], 'Response must include X-Request-Id header');
    assert(res.headers['x-request-id'].length > 10, 'Request ID should be a valid UUID');
  });

  await testAsync('Server preserves client-supplied X-Request-Id header', async () => {
    const customId = 'req_custom_trace_id_9999';
    const res = await makeRequest(app, {
      path: '/api/v1/health',
      headers: { 'X-Request-Id': customId }
    });
    assert.strictEqual(res.headers['x-request-id'], customId, 'Preserved incoming request ID');
  });

  // 3. Helmet HTTP Security Headers Test
  await testAsync('Helmet sets nosniff, frame protection, and Web Worker CSP directives', async () => {
    const res = await makeRequest(app, { path: '/api/v1/health' });

    // MIME sniffing guard
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff', 'X-Content-Type-Options must be nosniff');

    // Clickjacking frame protection
    assert.strictEqual(res.headers['x-frame-options'], 'DENY', 'X-Frame-Options must be DENY');

    // CSP header presence and blob: support for Web Workers
    const csp = res.headers['content-security-policy'];
    assert(csp, 'Content-Security-Policy header must be present');
    assert(csp.includes("worker-src 'self' blob:"), 'CSP must allow blob: in worker-src for Code Hub execution');
    assert(csp.includes("script-src 'self' 'unsafe-inline' blob:"), 'CSP must permit blob: script execution for Workers');
  });

  // 4. CORS Allowlist & Unauthorized Origin Rejection Test
  await testAsync('CORS allows requests from permitted staging/dev origins', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/health',
      headers: {
        'Origin': 'https://staging.campusone.edu'
      }
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers['access-control-allow-origin'], 'https://staging.campusone.edu');
  });

  await testAsync('CORS rejects requests from unapproved foreign origins with 403', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/health',
      headers: {
        'Origin': 'https://unauthorized-phishing-domain.xyz'
      }
    });
    assert.strictEqual(res.statusCode, 403, 'Unauthorized origin must be rejected with 403');
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /CORS policy violation/i);
  });

  // 5. Rate Limiting Protection Test
  await testAsync('Auth rate limiter rejects excessive login requests with HTTP 429', async () => {
    // Send 6 rapid requests when threshold is 5
    let lastResponse = null;
    for (let i = 0; i < 6; i++) {
      lastResponse = await makeRequest(app, {
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'test@campusone.edu', password: 'wrong' })
      });
    }

    assert.strictEqual(lastResponse.statusCode, 429, 'Excessive requests must return HTTP 429 Too Many Requests');
    assert.strictEqual(lastResponse.body.success, false);
    assert.match(lastResponse.body.message, /Too many/i);
  });

  // 6. Role Escalation Prevention on Registration
  await testAsync('Public registration blocks role escalation to admin without secret with 403', async () => {
    const res = await makeRequest(app, {
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Malicious Attacker',
        email: `attacker_${Date.now()}@test.edu`,
        password: 'Password123!',
        role: 'admin',
        adminSecret: 'invalid_passphrase'
      })
    });

    assert.strictEqual(res.statusCode, 403, 'Unauthorized admin registration must return 403');
    assert.strictEqual(res.body.success, false);
  });

  console.log(`\n===================================`);
  console.log(`Security & Staging Tests: ${passed}/${total} Passed (${Math.round((passed/total)*100)}%)`);
  console.log(`===================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runSecurityAndStagingTests();
