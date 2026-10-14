# CampusOne — Prioritized Implementation Plan (MERN Hardening)

**Date:** 2026-10-14  
**Status:** All 7 Implementation Phases Completed & Verified

---

## Roadmap Overview

```
Phase 1: Production-Safe API Client & Server Foundation          [✅ COMPLETE]
    └── Separate transport from mock providers, env validation, JWT/RBAC middleware, /auth/me
Phase 2: True Authentication & Persona Integration              [✅ COMPLETE]
    └── Connect AuthModal & AuthContext to backend, restrict public admin signup, demo-mode safety
Phase 3: Domain Persistence & Authoritative Academic Modeling   [✅ COMPLETE]
    └── Schemas (Student, Subject, Attendance), session recording, authoritative attendance calculations
Phase 4: Academic Views Integration                             [✅ COMPLETE]
    └── Wire StudentDashboard & AcademicsView to real backend APIs with loading/error states
Phase 5: Secure Assessment Lifecycle                            [✅ COMPLETE]
    └── Confidential question delivery, server-side grading, attempt persistence in MongoDB
Phase 6: Sandboxed Code Execution                               [✅ COMPLETE]
    └── Web Worker sandbox, execution timeouts, infinite loop protection for Code Hub
Phase 7: Automated Integration Testing & Verification           [✅ COMPLETE]
    └── 17 unit and integration tests for auth, RBAC, attendance, and assessment verification
```

---

## Phase 1 — Production-Safe API Client & Server Foundation ✅

### Deliverables:
- [x] Created `client/src/services/apiClient.js` with timeout, bearer token injection, and normalized error responses.
- [x] Separated mock/demo data into `client/src/services/demoData.js`.
- [x] Created `server/middleware/auth.js` (`protect`) verifying JWT tokens.
- [x] Created `server/middleware/authorize.js` (`authorize`) enforcing role permissions.
- [x] Removed hardcoded JWT fallback secret in `generateToken.js`.
- [x] Removed silent in-memory fallback in `config/db.js`.
- [x] Enforced bcrypt hashing and removed SHA-256 fallback in `models/User.js`.
- [x] Added startup environment validation in `server.js`.
- [x] Added `GET /api/v1/auth/me` and `POST /api/v1/auth/logout`.

---

## Phase 2 — True Authentication & Persona Integration ✅

### Deliverables:
- [x] Wired `AuthModal.jsx` and `AuthContext.jsx` to live `/api/v1/auth/login` and `/register`.
- [x] Hydrated user sessions on mount via `GET /api/v1/auth/me`.
- [x] Restricted public registration strictly to `student` role; admin/faculty signups require secret authorization.
- [x] Isolated persona switcher to client preview mode (`isDemoMode`) that clears real tokens.

---

## Phase 3 — Domain Persistence & Authoritative Academic Modeling ✅

### Deliverables:
- [x] Created Mongoose schemas for `Subject`, `StudentProfile`, `AttendanceSession`, and `AttendanceRecord`.
- [x] Enforced compound unique index `{ session: 1, student: 1 }` in `AttendanceRecord`.
- [x] Implemented authoritative attendance calculation on the server (`rate`, `safeBunks`, `deficit`).
- [x] Created faculty session attendance marking endpoint (`POST /api/v1/academics/attendance/mark`).
- [x] Created batch roster retrieval endpoint (`GET /api/v1/academics/roster/:batch`).

---

## Phase 4 — Academic Views Integration ✅

### Deliverables:
- [x] Connected `StudentDashboard.jsx` to live `academicsAPI.getStudentProfile()`.
- [x] Connected `AcademicsView.jsx` to live `academicsAPI.getSubjects()` with interactive session simulation.
- [x] Connected `TeacherDashboard.jsx` to live batch roster and persisted attendance marking.
- [x] Implemented loading and error recovery states across all academic views.

---

## Phase 5 — Secure Assessment Lifecycle ✅

### Deliverables:
- [x] Created Mongoose schemas for `Assessment` and `AssessmentAttempt`.
- [x] Implemented confidential question delivery (`GET /api/v1/tests/active`) with correct answers and explanations stripped.
- [x] Implemented server-side grading (`POST /api/v1/tests/submit`) calculating score, percentage, and pass/fail status.
- [x] Persisted attempts to MongoDB and implemented history endpoint (`GET /api/v1/tests/history`).
- [x] Connected `TestsView.jsx` to live confidential test delivery and server-side grading.

---

## Phase 6 — Sandboxed Code Execution ✅

### Deliverables:
- [x] Implemented `client/src/services/codeRunner.js` using isolated Web Workers.
- [x] Enforced 2,000ms execution timeout that terminates infinite loops without freezing the browser UI.
- [x] Blocked worker thread access to DOM, `window`, `document`, and cookies.
- [x] Connected `CodingHubView.jsx` to Web Worker sandbox runner.

---

## Phase 7 — Automated Integration Testing & Verification ✅

### Deliverables:
- [x] Created 4 automated backend test suites:
  - `server/test/authTest.js` (JWT, bcrypt, protect, and RBAC tests)
  - `server/test/academicTest.js` (Attendance math, schema validation, and unique index tests)
  - `server/test/assessmentTest.js` (Confidentiality, server grading, and attempt tests)
  - `server/test/adminAndCareerTest.js` (Admin RBAC, user management, and career math tests)
- [x] Added `npm test` scripts in server and root manifests (17/17 tests passing, 100% pass rate).
- [x] Verified frontend production build with Vite (built in 1.32s with 0 errors).
- [x] Verified all Node.js server files with `node -c` (0 syntax errors).
