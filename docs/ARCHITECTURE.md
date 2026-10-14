# CampusOne — Production Architecture

**Date:** 2026-10-14  
**Status:** Implemented & Verified (MERN Stack)

---

## 1. System Overview

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CAMPUSONE PLATFORM                                   │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│               React Client                │            Express API Server              │
│          (Vite + Vanilla CSS)             │           (Node.js + Mongoose)             │
│                                           │                                            │
│  ┌─────────────────────────────────────┐  │  ┌──────────────────────────────────────┐  │
│  │ Views & Personas                    │  │  │ Domain API Routers                   │  │
│  │ ├── Student Dashboard               │  │  │ ├── /api/v1/auth (Login, Register)   │  │
│  │ ├── Academics & Attendance          │◄─┼─►│ ├── /api/v1/academics (Courses, Roster)│
│  │ ├── Tests & Quiz Engine             │  │  │ ├── /api/v1/tests (Scoring, Grading) │  │
│  │ ├── DSA Coding Hub (Web Worker)     │  │  │ ├── /api/v1/career (Portfolio, ATS)  │  │
│  │ ├── Resume & Career Builder         │  │  │ ├── /api/v1/admin (User Provisioning)│  │
│  │ ├── Faculty & Teacher Portal        │  │  │ └── /api/v1/ai (Copilot Chat)        │  │
│  │ └── Institutional Admin Center      │  │  └──────────────────────────────────────┘  │
│  └─────────────────────────────────────┘  │                     │                      │
│                    │                      │                     ▼                      │
│                    ▼                      │  ┌──────────────────────────────────────┐  │
│  ┌─────────────────────────────────────┐  │  │ Middlewares & Security               │  │
│  │ Core Services & Context             │  │  │ ├── protect (JWT Verification)       │  │
│  │ ├── apiClient (HTTP + Timeouts)     │  │  │ ├── authorize (RBAC: Admin/Teacher) │  │
│  │ ├── AuthContext (Session + Preview) │  │  │ └── Centralized Error & 404 Handlers  │  │
│  │ ├── ThemeContext (Persistent Theme) │  │  └──────────────────────────────────────┘  │
│  │ └── codeRunner (Web Worker Sandbox) │  │                     │                      │
│  └─────────────────────────────────────┘  │                     ▼                      │
│                                           │  ┌──────────────────────────────────────┐  │
│                                           │  │ MongoDB Database Collections         │  │
│                                           │  │ ├── User                             │  │
│                                           │  │ ├── StudentProfile                   │  │
│                                           │  │ ├── Subject                          │  │
│                                           │  │ ├── AttendanceSession                │  │
│                                           │  │ ├── AttendanceRecord (Unique Index)  │  │
│                                           │  │ ├── Assessment                       │  │
│                                           │  │ └── AssessmentAttempt                │  │
│                                           │  └──────────────────────────────────────┘  │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### Technology Stack
- **Framework:** React 18
- **Build Tool:** Vite 6
- **Styling:** Vanilla CSS design system with CSS custom properties (`--bg`, `--sf`, `--ink`, `--ac`, `--hi`, `--bad`)
- **Typography:** Google Fonts (`Bricolage Grotesque`, `Instrument Sans`, `JetBrains Mono`)
- **Icons:** Lucide React
- **State Management:** React Context (`AuthContext`, `ThemeContext`)
- **Transport:** Centralized `apiClient.js` with `AbortController` timeouts and standard error normalization
- **Sandbox:** Dedicated Web Worker blob engine with 2,000ms infinite loop timeout guards

### Directory Layout
```
client/
├── index.html                    # HTML entry point with Google Fonts
├── vite.config.js                # Vite configuration with /api reverse proxy
├── package.json                  # React, Vite, Lucide React
├── dist/                         # Production build bundle
└── src/
    ├── main.jsx                  # React DOM root with ThemeProvider & AuthProvider
    ├── App.jsx                   # Central layout and active view router
    ├── index.css                 # Comprehensive design tokens, themes & animations
    ├── context/
    │   ├── AuthContext.jsx       # Real auth session hydration + isolated demo personas
    │   └── ThemeContext.jsx      # Light / dark theme persistence
    ├── services/
    │   ├── apiClient.js          # Production HTTP client (timeouts, Bearer injection)
    │   ├── api.js                # Structured domain API methods
    │   ├── demoData.js           # Isolated demo/mock catalogs
    │   └── codeRunner.js         # Web Worker sandboxed execution engine
    ├── components/
    │   ├── Navbar.jsx            # Floating glassmorphic navbar with tabs & role indicator
    │   ├── RoleSwitcherModal.jsx # Persona preview modal
    │   └── AuthModal.jsx         # Sign-in and account registration modal
    └── views/
        ├── StudentDashboard.jsx  # CGPA, timetable, dynamic attendance calculator
        ├── AcademicsView.jsx     # Subject roster, attendance rates, syllabus tracker
        ├── TestsView.jsx         # Confidential assessment taking & server grading
        ├── CodingHubView.jsx     # Algorithmic code editor & sandbox runner
        ├── ResumeCareerView.jsx  # ATS analyzer, technical projects, placement matches
        ├── TeacherDashboard.jsx  # Live student attendance marking & at-risk alerts
        ├── AdminDashboard.jsx    # User provisioning & institutional governance
        └── AiAssistantView.jsx   # Contextual academic & career copilot
```

---

## 3. Backend Architecture

### Technology Stack
- **Runtime:** Node.js (CommonJS modules)
- **Framework:** Express 4
- **Database Driver:** Mongoose 8 (MongoDB Atlas)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` (Salt rounds = 10)
- **CORS:** `cors` configured for `CLIENT_URL`
- **Testing:** Native Node test runner with strict assertions (`assert`)

### Directory Layout
```
server/
├── server.js                     # Express entry point & startup env validation
├── package.json                  # Dependencies, scripts, and npm test suite
├── .env                          # Configuration (PORT, MONGO_URI, JWT_SECRET)
├── config/
│   └── db.js                     # MongoDB connection handler
├── middleware/
│   ├── auth.js                   # JWT bearer token verification (protect)
│   └── authorize.js              # Role-based access control (authorize)
├── models/
│   ├── User.js                   # User credentials, roles, and password hashing
│   ├── StudentProfile.js         # Roll, batch, CGPA, skills, verified projects
│   ├── Subject.js                # Course codes, credits, syllabus coverage
│   ├── AttendanceSession.js      # Individual class session log
│   ├── AttendanceRecord.js       # Student attendance record with unique compound index
│   ├── Assessment.js             # Assessment questions with confidential answer keys
│   └── AssessmentAttempt.js      # Persisted student test scores and percentages
├── routes/
│   ├── academic.routes.js        # /api/v1/academics (subjects, profile, roster, mark)
│   ├── test.routes.js            # /api/v1/tests (confidential questions, submit, history)
│   ├── career.routes.js          # /api/v1/career (profile, projects, scan-ats)
│   ├── admin.routes.js           # /api/v1/admin (users, status, metrics)
│   └── ai.routes.js              # /api/v1/ai (chat copilot)
├── utils/
│   ├── generateToken.js          # Hardened JWT token generation
│   └── catData.js                # Concept catalog & topic study notes
└── test/
    ├── authTest.js               # JWT, bcrypt, protect, and RBAC tests
    ├── academicTest.js           # Attendance math, schema validation, and unique index tests
    ├── assessmentTest.js         # Confidentiality, server grading, and attempt tests
    └── adminAndCareerTest.js     # Admin RBAC, user management, and career math tests
```

---

## 4. Database Schema & Indexing

```
User (users)
  ├── _id: ObjectId (Primary Key)
  ├── email: String (Unique, Indexed, Lowercase)
  ├── password: String (Bcrypt Hash)
  ├── role: Enum ['student', 'teacher', 'admin']
  └── division: String

Subject (subjects)
  ├── _id: ObjectId (Primary Key)
  ├── code: String (Unique, Indexed, Uppercase e.g. 'CS-601')
  ├── name: String
  ├── credits: Number (1-6)
  └── syllabusCoverage: Number (0-100)

AttendanceSession (attendancesessions)
  ├── _id: ObjectId (Primary Key)
  ├── subject: ObjectId -> Subject (Indexed)
  ├── faculty: ObjectId -> User (Indexed)
  ├── batch: String
  ├── topic: String
  └── date: Date (Indexed)

AttendanceRecord (attendancerecords)
  ├── _id: ObjectId (Primary Key)
  ├── session: ObjectId -> AttendanceSession (Indexed)
  ├── student: ObjectId -> User (Indexed)
  ├── status: Enum ['present', 'absent']
  └── INDEX: { session: 1, student: 1 } (UNIQUE)

Assessment (assessments)
  ├── _id: ObjectId (Primary Key)
  ├── title: String
  ├── topic: Enum ['DSA', 'DBMS', 'AI/ML', 'OS', 'ALL']
  ├── timeLimitMinutes: Number
  ├── passingPercentage: Number
  └── questions: Array
        ├── question: String
        ├── options: [String]
        ├── correct: Number (Confidential)
        └── explanation: String (Confidential)

AssessmentAttempt (assessmentattempts)
  ├── _id: ObjectId (Primary Key)
  ├── assessment: ObjectId -> Assessment (Indexed)
  ├── student: ObjectId -> User (Indexed)
  ├── score: Number
  ├── total: Number
  ├── percentage: Number
  ├── passed: Boolean
  └── answers: Map<String, Number>
```

---

## 5. Security & Verification Summary

1. **Authentication:** Passwords hashed with bcrypt (salt = 10). JWT tokens issued for 30 days. No hardcoded secret fallbacks.
2. **Authorization (RBAC):** Privileged faculty routes require `'teacher'` or `'admin'`. Admin user provisioning strictly requires `'admin'`.
3. **Public Registration Guard:** Public signup defaults strictly to `'student'`. Role elevation to `'admin'` or `'teacher'` requires an authorized administrative secret.
4. **Attendance Integrity:** Database-level compound unique index prevents duplicate attendance records. Server computes compliance rates from real session records.
5. **Assessment Confidentiality:** Question retrieval strips `correct` index and explanations. Grading occurs exclusively on the server.
6. **Code Sandbox:** Browser JavaScript runs in isolated Web Workers with a 2,000ms execution cap, preventing UI freezes from infinite loops and blocking DOM/cookie access.
7. **Automated Testing:** 17 comprehensive unit and integration tests passing with 100% success rate across all domains.
