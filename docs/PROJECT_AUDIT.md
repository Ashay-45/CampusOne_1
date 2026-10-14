# CampusOne — Comprehensive Project Audit (Post-React Transition)

**Audit Date:** 2026-10-14  
**Audit Scope:** Full codebase audit covering frontend (React 18 + Vite), backend (Node.js + Express), MongoDB/Mongoose schemas, authentication, API contracts, security vectors, and test readiness.

---

## 1. Actual Repository Structure

```
CampusOne1/
├── .env.example                    # Environment template
├── .gitignore                      # Git exclusion rules (node_modules, .env, dist, logs)
├── .git/                           # Git repository
├── index.html                      # Standalone HTML reference prototype (6,567 lines)
├── package.json                    # Workspace root scripts (client, server, dev)
├── package-lock.json               # Root lockfile
├── node_modules/                   # Root dependencies (concurrently)
├── docs/                           # Architectural, audit, and planning documentation
│   ├── ARCHITECTURE.md
│   ├── FEATURE_INVENTORY.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── PRODUCTION_GAP_ANALYSIS.md
│   └── PROJECT_AUDIT.md
├── client/                         # React 18 + Vite frontend
│   ├── index.html                  # Client HTML entry point (Google Fonts: Bricolage & Instrument)
│   ├── vite.config.js              # Vite config with React plugin and /api proxy (port 5173 -> 5000)
│   ├── package.json                # React, Vite, React Router, Lucide React
│   ├── package-lock.json           # Client lockfile
│   ├── node_modules/               # Installed client dependencies
│   ├── dist/                       # Verified production build output
│   └── src/
│       ├── main.jsx                # React root with ThemeProvider & AuthProvider
│       ├── App.jsx                 # View router & modal coordinator
│       ├── index.css               # Design system tokens, dark/light themes, glassmorphism
│       ├── context/
│       │   ├── AuthContext.jsx     # Client auth state & persona switching
│       │   └── ThemeContext.jsx    # Persistent light/dark mode
│       ├── services/
│       │   └── api.js              # API transport & bundled mock data
│       ├── components/
│       │   ├── Navbar.jsx          # Glassmorphic top navigation with tabs & role selector
│       │   ├── RoleSwitcherModal.jsx # Persona switcher modal (Student, Teacher, Admin)
│       │   └── AuthModal.jsx       # Modal for login, registration, and session info
│       └── views/
│           ├── StudentDashboard.jsx# Student overview, timetable, attendance calculator
│           ├── AcademicsView.jsx   # Subject attendance roster & syllabus tracker
│           ├── AiAssistantView.jsx # Academic AI copilot chat
│           ├── TestsView.jsx       # Timed MCQ assessment engine & results
│           ├── CodingHubView.jsx   # DSA problem catalog & browser code runner
│           ├── ResumeCareerView.jsx# ATS score analyzer & job matches
│           ├── TeacherDashboard.jsx# Faculty attendance marker & deficiency alerts
│           └── AdminDashboard.jsx  # User management & department metrics
└── server/                         # Node.js + Express backend
    ├── server.js                   # Express application entry point
    ├── package.json                # Dependencies: Express, Mongoose, JWT, bcryptjs, CORS, dotenv
    ├── package-lock.json           # Server lockfile
    ├── node_modules/               # Installed server dependencies
    ├── .env                        # Local server configuration (contains connection URI & JWT secret)
    ├── config/
    │   └── db.js                   # Mongoose connection with in-memory fallback warning
    ├── models/
    │   └── User.js                 # User schema (bcrypt pre-save, SHA-256 fallback)
    └── utils/
        ├── catData.js              # Topic catalog & study concepts
        └── generateToken.js        # JWT generation with fallback secret
```

---

## 2. Findings on the 10 Audit Questions

### 1. Which features actually work?
- **Frontend UI & Navigation:** Fully reactive navigation across 8 core views (`StudentDashboard`, `AcademicsView`, `AiAssistantView`, `TestsView`, `CodingHubView`, `ResumeCareerView`, `TeacherDashboard`, `AdminDashboard`).
- **Dark/Light Theme System:** Live theme toggling persisted to `localStorage` and `data-theme` attribute on `<html>`.
- **In-Browser Code Execution:** `CodingHubView` executes JavaScript test cases directly in the client context using `new Function`.
- **Assessment MCQ Engine:** `TestsView` handles topic filtering, timer countdown, option selection, score calculation, and review rendering in React state.
- **Dynamic Attendance Math:** `StudentDashboard` calculates missable/required classes using client formulas.
- **Backend Health & Diagnostics:** `GET /api/v1/health` returns HTTP 200 with database status.
- **Production Build:** `npm run build` in `client/` builds cleanly in under 2 seconds.

### 2. Which features use hardcoded data?
- **Student Dashboard:** Timetable schedule, cumulative CGPA (8.84), 106/120 attendance counts, and weak topic diagnostic scores are hardcoded in `StudentDashboard.jsx`.
- **Academics View:** All 5 subjects (`CS-601`, `CS-602`, `CS-603`, `CS-604`, `CS-605`), their conducted/attended counts, syllabus %, and faculty names are initialized in React state.
- **Resume & Career:** ATS score (84), technical skills array, verified projects list, and campus placement match opportunities are hardcoded in `ResumeCareerView.jsx`.
- **Teacher Dashboard:** Roster of 6 students (`CS-2023-040` through `CS-2023-045`) is hardcoded in component state.
- **Admin Dashboard:** Active user registry and department metric cards are static arrays in `AdminDashboard.jsx`.

### 3. Which features use mock responses or simulated delays?
- **Authentication:** `AuthContext.login()` simulates authentication by returning `defaultUsers[role]` and generating a fake `jwt_session_<timestamp>`. It does not execute a network call.
- **AI Mentor:** `AiAssistantView` uses `setTimeout(..., 700)` with basic string matching (`knapsack`, `os`, `sql`) to generate simulated responses.
- **Resume ATS Analyzer:** Re-scanning ATS score uses an 800ms `setTimeout` to flip the score from 84 to 88.
- **API Service Layer:** `client/src/services/api.js` directly bundles and exports `mockQuestions` and `mockCodingProblems`.

### 4. Which APIs are implemented?
- `GET /api/v1/health` — Returns system health and DB connectivity status.
- `POST /api/v1/auth/login` — Validates credentials against MongoDB `User` collection and issues JWT.
- `POST /api/v1/auth/register` — Creates user in MongoDB `User` collection and issues JWT.
- `GET /api/v1/tests/topics` — Returns topic catalog from `catData.js`.
- **Missing APIs:** No endpoints exist for student profile retrieval/updates, subject catalogs, attendance sessions/records, assessment attempts/submissions, code execution, or admin management.

### 5. Which operations persist to MongoDB?
- **Only `POST /api/v1/auth/register` and `POST /api/v1/auth/login` interact with MongoDB.**
- **No other operation persists.** All simulated attendance changes, quiz attempts, code submissions, and profile edits evaporate on page reload.

### 6. Which authentication mechanisms are functional?
- **Backend:** `User` model with bcrypt hashing and JWT generation (`generateToken.js`) is functional when hit directly.
- **Frontend Integration:** Non-functional. The client `AuthModal` calls `AuthContext.login()`, which bypasses the backend and uses local state.
- **Session Protection:** No JWT verification middleware (`protect`/`auth.js`) is attached to backend routes.
- **User Endpoint:** No `GET /api/v1/auth/me` endpoint exists for validating active sessions.
- **Role Elevation Vulnerability:** `POST /api/v1/auth/register` accepts `role` directly from `req.body`, allowing unrestricted creation of `admin` accounts.

### 7. Whether role switching is merely a UI simulation?
- **YES. 100% UI Simulation.** Clicking the role badge swaps local React context state between hardcoded mock personas (`Aarav Sharma`, `Dr. Priya Raman`, `Campus Administrator`). It does not authenticate with or change authorization claims on the backend.

### 8. Whether any secrets or insecure fallbacks remain?
- **Hardcoded JWT Fallback:** `server/utils/generateToken.js` falls back to `'campusone_super_secret_jwt_key_2026'` if `JWT_SECRET` is unset.
- **In-Memory Fallback:** `server/config/db.js` catches MongoDB connection errors and enables `isInMemoryFallback = true` rather than failing fast.
- **Legacy SHA-256 Fallback:** `server/models/User.js` contains a legacy SHA-256 password comparison block.
- **Credential Storage:** `server/.env` contains credentials which must not be committed to git or exposed in logs.
- **Unrestricted Code Execution:** `CodingHubView` runs `new Function(...)` on the main browser thread without timeout or sandbox constraints.

### 9. Whether the frontend and backend agree on API contracts?
- **NO.**
- The frontend `api.js` has only `getHealth()`, with zero functions defined for auth, academic profiles, courses, or assessments.
- When `client/src/views/TestsView.jsx` runs, it imports questions directly from local mock arrays rather than requesting an API.
- The backend returns `{ success, token, user }` from auth routes, while the frontend `AuthContext` expects `{ success: true, user }` without storing the actual backend JWT.

### 10. Which critical tests are missing?
- **Backend Automated Tests:** Zero tests exist. No test framework (`supertest`, `jest`, or `mocha`) is installed in `server/package.json`.
- **Frontend Automated Tests:** Zero tests exist. No test framework (`vitest`, `@testing-library/react`) is configured in `client/package.json`.
- **Missing Test Suites:**
  1. Auth integration tests (registration, login, duplicate accounts, password comparison).
  2. Role-based authorization middleware tests (preventing students from teacher/admin routes).
  3. MongoDB schema validation and indexing tests.
  4. Server-side attendance calculation & percentage accuracy tests.
  5. Server-side assessment scoring & correct-answer confidentiality tests.

---

## 3. Immediate Action Plan

1. **Production-Safe API Client (`client/src/services/api.js`):**
   - Create centralized Axios/Fetch client with interceptors for JWT Bearer tokens, unified error handling, timeouts, and explicit demo-mode toggles.
2. **Backend Authentication & Authorization Layer:**
   - Implement `auth` (JWT verification) and `authorize` (role restriction) middleware.
   - Implement `GET /api/v1/auth/me`.
   - Prevent public admin registration; sanitize role assignment on signup.
   - Remove fallback secrets and legacy SHA-256 code.
3. **Connect Frontend Auth to Backend:**
   - Wire `AuthModal` and `AuthContext` to make actual API calls to `/api/v1/auth/*`.
   - Restrict the role switcher to an explicit `DEMO_MODE` flag so it never bypasses backend security.
4. **Core MongoDB Domain Schemas:**
   - Implement `StudentProfile`, `TeacherProfile`, `Subject`, `AttendanceSession`, `AttendanceRecord`.
5. **Connect Academic & Assessment Modules:**
   - Replace hardcoded academic & attendance data with API endpoints backed by MongoDB.
   - Move assessment scoring and correct-answer validation to the backend.
6. **Code Runner Security:**
   - Sandbox code execution with Web Workers and strict execution timeouts.
7. **Automated Testing Setup:**
   - Add test runner to backend and verify auth, persistence, and endpoints.
