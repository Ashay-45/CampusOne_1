# CampusOne

CampusOne is a full-stack academic and career support platform for students, teachers, and administrators. It combines a React web app with a Node.js/Express API and MongoDB persistence. The client also includes demo personas so the interface can be explored without signing in.

## Features

- Student dashboards for academic progress, subjects, timetables, and attendance.
- Teacher workflows for viewing class rosters and recording attendance.
- Timed assessments with server-side scoring and attempt history.
- A JavaScript coding hub that runs code in a browser Web Worker.
- Career profiles, project portfolios, and resume/ATS tools.
- An academic and career assistant with rule-based responses.
- Authentication, role-based API authorization, and an administration interface.
- Light and dark themes.

Some screens support demo data and persona previews. To use API-backed workflows, configure and run the backend with MongoDB; demo personas do not grant backend permissions.

## Technology

- **Client:** React 18, Vite 6, React Router, vanilla CSS, Lucide
- **Server:** Node.js, Express 4, Mongoose 8
- **Database:** MongoDB (local or Atlas)
- **Authentication:** JSON Web Tokens and bcryptjs

## Project structure

```text
.
├── client/                 # React + Vite application
│   ├── src/components/     # Shared UI components
│   ├── src/context/        # Authentication and theme state
│   ├── src/services/       # API clients, demo data, code runner
│   └── src/views/          # Student, teacher, admin, and feature views
├── server/                 # Express API
│   ├── config/             # MongoDB connection
│   ├── middleware/         # Authentication and authorization
│   ├── models/             # Mongoose models
│   ├── routes/              # API route modules
│   └── test/               # Backend test suites
├── docs/                   # Architecture, deployment, and project reports
├── .env.example            # Backend environment variable template
└── package.json            # Root development scripts
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB, either a local instance or an Atlas connection string

## Get started

1. Clone the repository and enter its directory:

   ```sh
   git clone https://github.com/Ashay-45/CampusOne_1.git
   cd CampusOne_1
   ```

2. Install dependencies for the root project, client, and server:

   ```sh
   npm run install:all
   ```

3. Copy `.env.example` to `server/.env` and set at least `MONGO_URI` and `JWT_SECRET`. For local MongoDB, the template's URI can be used. Replace the example JWT secret with a unique, randomly generated secret before use beyond local development.

   The template also defines `PORT`, `NODE_ENV`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `ADMIN_REGISTRATION_SECRET`, and optional proxy/rate-limit settings. Keep real secrets in your local environment; do not commit them.

4. Start the API and client together:

   ```sh
   npm run dev
   ```

   The Vite development server is at [http://localhost:5173](http://localhost:5173) and proxies `/api` requests to the API at `http://localhost:5000`.

To start either service separately, use `npm run server` or `npm run client` from the repository root.

## Useful commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the client and API concurrently |
| `npm run server` | Start the API in development mode |
| `npm run client` | Start the Vite development server |
| `npm test` | Run the backend test suites |
| `npm run build --prefix client` | Build the client for production |
| `npm run test:smoke --prefix server` | Run backend staging smoke tests |

The API health endpoint is `GET /api/v1/health`. The API requires a reachable MongoDB database outside test mode.

## Deployment and documentation

The client and API can be deployed separately. The client includes Vercel SPA routing configuration; the deployment guide documents the project's managed-hosting setup and environment configuration.

- [Architecture](./docs/ARCHITECTURE.md)
- [Deployment guide](./docs/DEPLOYMENT.md)
- [Feature inventory](./docs/FEATURE_INVENTORY.md)
- [Known limitations](./docs/KNOWN_LIMITATIONS.md)
- [Security review](./docs/SECURITY_REVIEW.md)
- [Release readiness](./docs/RELEASE_READINESS_REPORT.md)
- [Integration test results](./docs/INTEGRATION_TEST_RESULTS.md)

## License

No license file is currently included in this repository. Contact the project owner for licensing terms before reusing or distributing the project.
