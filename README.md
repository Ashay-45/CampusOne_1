# CampusOne 🎓

> **AI-Powered Student Academic, Skills & Career Development Platform**  
> Built strictly with the **MERN Stack** (MongoDB, Express.js, React 18 with Vite, Node.js) and Vanilla CSS design system.

[![Build Status](https://img.shields.io/badge/Vite%20Build-Passing-success)](https://github.com/Ashay-45/CampusOne_1)
[![Automated Tests](https://img.shields.io/badge/Automated%20Tests-28%2F28%20Passed-brightgreen)](https://github.com/Ashay-45/CampusOne_1)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-forestgreen)](https://cloud.mongodb.com)
[![Security](https://img.shields.io/badge/Security-Helmet%20%7C%20RBAC%20%7C%20Rate%20Limited-darkviolet)](./docs/SECURITY_REVIEW.md)

---

## 🌟 Overview

**CampusOne** is an institutional web platform that unifies academic progress tracking, attendance compliance, technical skill diagnostics, sandboxed coding challenges, ATS resume scoring, and academic mentorship into one cohesive experience for students, faculty, and administrators.

---

## 🚀 Core Features

### 1. 🎓 Academics & Dynamic Attendance
- **Authoritative Server Calculations:** Live attendance rates, safe bunks remaining, and consecutive session deficit recovery projections computed against statutory 75% thresholds.
- **Faculty Roll Call:** Teachers mark session attendance for assigned courses (`subjectsHandled` RBAC boundary); persisted in MongoDB with compound unique constraints `{ session: 1, student: 1 }`.
- **Institutional Timetable:** Interactive daily schedules with ongoing, completed, and upcoming lecture slots.

### 2. 📝 Assessment Hub & Server-Side Scoring
- **Confidential Question Delivery:** Assessment catalog strips confidential answer keys and explanations before delivering questions to students.
- **Authoritative Grading:** Scores and passing statuses are calculated strictly on the backend against database ground truth.
- **Timing & Attempt Constraints:** Server enforces maximum time limit + grace periods and rejects expired submissions.
- **Strict Data Isolation:** Students can only access their own attempt results; cross-student attempt snooping is blocked (HTTP 403).

### 3. 💻 Sandboxed Coding Hub
- **Isolated Web Worker Execution:** JavaScript algorithm execution runs in an isolated browser Web Worker off the main UI thread.
- **Infinite Loop Defense:** Strict 2,000ms timeout monitor kills runaway loops and recursion.
- **Network Lockdown:** Worker-internal APIs (`fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts`) are nullified to block data exfiltration.
- **Host Process Safety:** Zero student code is executed on the Express server.

### 4. 💼 Career Portfolio & Dynamic ATS Resume Scoring
- **Portfolio Showcase:** Technical projects and verified skills persist on student profiles.
- **Dynamic ATS Scoring:** Real-time resume index recomputes based on verified skill density and project impact (bounded between 75 and 96).

### 5. 🤖 Academic AI Copilot
- **Transparent Decision Engine:** Rule-based academic advisory decision engine honestly disclosed with `isModelGenerated: false` and `provider: campusone-rule-engine`.
- **Input Bounding:** Message prompts are bounded to 2,000 characters with dedicated rate limiting.
- **Extensible Architecture:** Designed to connect external LLM providers (e.g. Google Gemini 1.5 Flash) via environment secrets and cost controls.

### 6. 🛡️ Institutional Administration Console
- **Role-Based Access Control:** Dedicated admin routes protected with RBAC middleware (HTTP 403 on non-admin access).
- **User Provisioning:** Create student and faculty accounts; public sign-up cannot escalate to `admin` without `ADMIN_REGISTRATION_SECRET`.
- **Account Deactivation:** Toggling account status to inactive immediately revokes JWT API access via middleware check.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Component-driven UI, fast HMR, optimized production build |
| **Styling** | Vanilla CSS | Custom design system, dark/light themes, fluid typography |
| **Routing** | React Router v6 | Client-side routing with SPA rewrite support |
| **Backend** | Node.js, Express.js | REST APIs, modular routers, centralized error handling |
| **Database** | MongoDB, Mongoose 8 | Schema models, compound unique indexes, connection pooling |
| **Authentication**| JWT, Bcrypt.js | HMAC-SHA256 bearer tokens, 10 salt rounds password hashing |
| **Security** | Helmet, Express Rate Limit | Strict CSP with Web Worker support, CORS allowlist, IP throttling |
| **Observability** | Crypto UUID, JSON Logger | `X-Request-Id` correlation headers, structured access logs |

---

## 📁 Repository Structure

```text
CampusOne/
├── client/                     # Frontend React + Vite Application
│   ├── src/
│   │   ├── components/         # Shared UI: Navbar, StatCard, ProgressBar, etc.
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── services/           # apiClient.js, api.js, codeRunner.js (Web Worker)
│   │   ├── views/              # StudentDashboard, AcademicsView, TestsView, etc.
│   │   ├── App.jsx             # Root application & routing
│   │   └── main.jsx            # React entry point
│   ├── vercel.json             # SPA routing rewrite rule for Vercel
│   ├── vite.config.js          # Vite bundler configuration
│   └── package.json
├── server/                     # Backend Express REST API
│   ├── config/                 # db.js (Atlas connection & monitoring)
│   ├── middleware/             # auth.js (JWT protect), authorize.js (RBAC)
│   ├── models/                 # User, StudentProfile, Subject, AttendanceRecord, etc.
│   ├── routes/                 # academic, test, career, ai, admin routers
│   ├── test/                   # Automated test suites & staging smoke test runner
│   │   ├── authTest.js
│   │   ├── academicTest.js
│   │   ├── assessmentTest.js
│   │   ├── adminAndCareerTest.js
│   │   ├── e2eWorkflowTest.js
│   │   ├── securityAndStagingTest.js
│   │   └── stagingSmokeTest.js
│   ├── utils/                  # generateToken.js, catData.js, seedData.js
│   ├── server.js               # Main Express entry point & middleware stack
│   └── package.json
├── docs/                       # Project Documentation & Audits
│   ├── ARCHITECTURE.md         # Full system architecture & data flow diagrams
│   ├── DEPLOYMENT.md           # Staging & production deployment guide
│   ├── SECURITY_REVIEW.md      # Security review & hardening matrix
│   ├── RELEASE_READINESS_REPORT.md # Release readiness evaluation
│   ├── INTEGRATION_TEST_RESULTS.md # Automated test suite documentation
│   └── KNOWN_LIMITATIONS.md    # Known limitations and architectural boundaries
├── .env.example                # Safe environment configuration template
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** 18.x or 20.x
- **npm** 9.x or later
- **MongoDB** (Local instance or MongoDB Atlas cluster URI)

### 1. Clone the Repository
```bash
git clone https://github.com/Ashay-45/CampusOne_1.git
cd CampusOne_1
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env` and configure your local or Atlas settings:
```bash
cp .env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/campusone
JWT_SECRET=your_secure_random_jwt_secret_here_min_32_chars
CLIENT_URL=http://localhost:5173
ADMIN_REGISTRATION_SECRET=campusone_admin_setup_2026
```

### 3. Install Dependencies
```bash
# Install backend dependencies
npm install --prefix server

# Install frontend dependencies
npm install --prefix client
```

### 4. Run Development Servers
In two separate terminals:

```bash
# Terminal 1: Launch Backend API (Port 5000)
npm run dev --prefix server

# Terminal 2: Launch Frontend Client (Port 5173)
npm run dev --prefix client
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Testing & Verification

CampusOne includes **28 automated tests across 6 test suites** plus an automated **15-point staging smoke test runner**.

### Run Complete Automated Test Suite
```bash
npm test --prefix server
```

**Test Suites Executed:**
1. `authTest.js` — Token generation, Bcrypt matching, RBAC middleware, tampered token rejection.
2. `academicTest.js` — Statutory attendance math, safe bunks, subject schema validation, faculty guards.
3. `assessmentTest.js` — Answer stripping, server-side grading, attempt boundaries.
4. `adminAndCareerTest.js` — Admin isolation, technical portfolio persistence, dynamic ATS score bounds.
5. `e2eWorkflowTest.js` — Deactivated account token rejection, teacher course boundaries, student result isolation, AI disclosure.
6. `securityAndStagingTest.js` — CORS allowlist, Helmet security headers, rate limiting (HTTP 429), correlation IDs, role escalation blocks.

### Run Staging Smoke Tests
```bash
# Run against local server or live staging URL:
npm run test:smoke --prefix server
```

### Verify Frontend Production Build
```bash
npm run build --prefix client
```

---

## 🌐 Staging & Production Deployment

CampusOne is configured for managed cloud deployment:
- **Frontend:** [Vercel](https://vercel.com) (Edge CDN with SPA rewrite support via `client/vercel.json`)
- **Backend:** [Render](https://render.com) (Managed Node.js Web Service with automatic HTTPS and health checks)
- **Database:** [MongoDB Atlas](https://cloud.mongodb.com) (Managed 3-node replica set with automated backups)

For step-by-step setup instructions, environment variables, NGINX configurations, and disaster recovery procedures, see:  
📖 **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**

---

## 📖 Documentation Index

- 📘 [Architecture Specification](./docs/ARCHITECTURE.md)
- 🚀 [Deployment Guide](./docs/DEPLOYMENT.md)
- 🔒 [Application Security Review](./docs/SECURITY_REVIEW.md)
- 📋 [Release Readiness Report](./docs/RELEASE_READINESS_REPORT.md)
- 🧪 [Integration Test Results](./docs/INTEGRATION_TEST_RESULTS.md)
- ⚠️ [Known Limitations & Boundaries](./docs/KNOWN_LIMITATIONS.md)

---

## 📄 License

This project is licensed under the MIT License.
