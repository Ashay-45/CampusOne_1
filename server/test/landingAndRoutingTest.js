/**
 * CampusOne - Landing Page, Routing & Privacy Verification Suite
 * Tests frontend architectural guarantees:
 * 1. Root route renders LandingPage, not StudentDashboard
 * 2. LandingPage contains zero student PII or confidential records
 * 3. Public routes (/, /login, /register) and protected dashboard routes exist
 * 4. ProtectedRoute enforces role guards and prevents content flashing
 * 5. Public registration blocks assignment of teacher/admin roles
 * 6. Light editorial design system tokens are defined correctly
 * 7. Navbar includes safe sign-out returning to public root
 * 8. Client production build artifacts exist and are valid
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const clientSrc = path.join(rootDir, 'client/src');

console.log('🧪 Starting CampusOne Landing Page, Routing & Privacy Verification Tests...\n');

let passedTests = 0;
const totalTests = 8;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// TEST 1: Root route renders LandingPage
runTest('App.jsx root route "/" renders LandingPage and not StudentDashboard', () => {
  const appContent = fs.readFileSync(path.join(clientSrc, 'App.jsx'), 'utf-8');
  assert(
    appContent.includes('<Route path="/" element={<LandingPage />} />'),
    'Root path "/" must mount LandingPage component'
  );
  assert(
    !appContent.includes('<Route path="/" element={<StudentDashboard'),
    'Root path must never mount StudentDashboard directly'
  );
});

// TEST 2: LandingPage contains zero student PII
runTest('LandingPage.jsx contains zero student PII or private academic records', () => {
  const landingContent = fs.readFileSync(path.join(clientSrc, 'views/LandingPage.jsx'), 'utf-8');
  const forbiddenPII = [
    'Aarav',
    'Sharma',
    'CS-2023-042',
    '8.84',
    '88.5%',
    'ranking: 4',
    'demo_std_01'
  ];
  for (const pii of forbiddenPII) {
    assert(
      !landingContent.includes(pii),
      `Landing page must not expose private data: found "${pii}"`
    );
  }
  // Verify required hero and section headlines
  assert(landingContent.includes('Your Campus. Your Skills.'), 'Must include required headline');
  assert(landingContent.includes('One platform to manage academics'), 'Must include supporting text');
  assert(landingContent.includes('Academics'), 'Must include feature Academics');
  assert(landingContent.includes('Assessments'), 'Must include feature Assessments');
  assert(landingContent.includes('Code Hub'), 'Must include feature Code Hub');
  assert(landingContent.includes('AI Mentor'), 'Must include feature AI Mentor');
  assert(landingContent.includes('Resume & Career'), 'Must include feature Resume & Career');
  assert(landingContent.includes('Progress Tracking'), 'Must include feature Progress Tracking');
});

// TEST 3: Public and Protected routes exist with role constraints
runTest('App.jsx enforces role constraints on /dashboard, /teacher, and /admin', () => {
  const appContent = fs.readFileSync(path.join(clientSrc, 'App.jsx'), 'utf-8');
  assert(appContent.includes('allowedRoles={[\'student\']}'), 'Must protect /dashboard with student role');
  assert(appContent.includes('allowedRoles={[\'teacher\']}'), 'Must protect /teacher with teacher role');
  assert(appContent.includes('allowedRoles={[\'admin\']}'), 'Must protect /admin with admin role');
  assert(appContent.includes('<Route path="/login"'), 'Must define public /login route');
  assert(appContent.includes('<Route path="/register"'), 'Must define public /register route');
});

// TEST 4: ProtectedRoute prevents unauthenticated access and content flashing
runTest('ProtectedRoute component guards against unauthenticated access and loading flash', () => {
  const guardContent = fs.readFileSync(path.join(clientSrc, 'components/ProtectedRoute.jsx'), 'utf-8');
  assert(guardContent.includes('if (loading)'), 'Must check loading state before rendering content');
  assert(guardContent.includes('Navigate to="/login"'), 'Must redirect unauthenticated users to /login');
  assert(guardContent.includes('allowedRoles.includes(role)'), 'Must check role membership');
});

// TEST 5: Registration safety prevents public assignment of teacher/admin roles
runTest('RegisterPage strictly assigns student role and blocks privileged role assignment', () => {
  const regContent = fs.readFileSync(path.join(clientSrc, 'views/RegisterPage.jsx'), 'utf-8');
  assert(
    regContent.includes("role: 'student'"),
    'Registration must strictly assign student role'
  );
  assert(
    !regContent.includes('<select name="role"'),
    'Registration form must not allow arbitrary role selection'
  );
});

// TEST 6: Design system CSS defines the warm editorial palette
runTest('index.css implements the required educational design system color tokens', () => {
  const cssContent = fs.readFileSync(path.join(clientSrc, 'index.css'), 'utf-8');
  assert(cssContent.includes('--bg: #FAF9F6;'), 'Missing background #FAF9F6 token');
  assert(cssContent.includes('--ink: #242824;'), 'Missing primary text #242824 token');
  assert(cssContent.includes('--ac: #247C70;'), 'Missing primary accent #247C70 token');
  assert(cssContent.includes('--hi: #E5A64B;'), 'Missing secondary accent #E5A64B token');
  assert(cssContent.includes('--bd: #E5E7E3;'), 'Missing border #E5E7E3 token');
  assert(cssContent.includes('--mut: #727871;'), 'Missing secondary text #727871 token');
  assert(cssContent.includes('--footer-bg: #242824;'), 'Missing footer background #242824 token');
});

// TEST 7: Navbar includes safe sign-out returning to public root
runTest('Navbar handles unauthenticated user safely and provides sign-out to root', () => {
  const navContent = fs.readFileSync(path.join(clientSrc, 'components/Navbar.jsx'), 'utf-8');
  assert(navContent.includes('userAvatar'), 'Must provide null-safe avatar access');
  assert(navContent.includes('userName'), 'Must provide null-safe name access');
  assert(navContent.includes("navigate('/', { replace: true })"), 'Logout must redirect to public root');
});

// TEST 8: Client production build files exist
runTest('Client production build artifacts exist and HTML entry point is present', () => {
  const distHtml = path.join(rootDir, 'client/dist/index.html');
  assert(fs.existsSync(distHtml), 'client/dist/index.html must exist from build');
  const htmlContent = fs.readFileSync(distHtml, 'utf-8');
  assert(htmlContent.includes('<div id="root"></div>'), 'HTML must have root mount point');
});

console.log(`\n===================================`);
console.log(`Landing & Routing Tests: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log(`===================================\n`);
