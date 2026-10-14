# CampusOne — Known System Limitations & Architectural Boundaries

**Project:** CampusOne  
**Evaluation Date:** October 2026  
**Document Purpose:** Clear, honest accounting of existing architectural trade-offs, operational limits, and boundaries of the current implementation.

---

## 1. Code Execution Architecture Limitations

The **CampusOne Code Hub** utilizes client-side HTML5 Web Workers to isolate and execute JavaScript code.

| Limitation | Impact | Architectural Reason | Production Recommendation |
| :--- | :--- | :--- | :--- |
| **Language Support Restricted to JavaScript** | Students cannot execute Python, C++, or Java code in the Code Hub. | Web Workers run natively inside the browser's JavaScript V8 engine. Compiling other languages requires WebAssembly (WASM) runtimes or backend containerization. | Integrate Pyodide (WASM) for client-side Python or an isolated serverless runner (e.g., AWS Lambda / Dockerized Judge0) for multi-language execution. |
| **Client-Side Compute Variability** | Execution benchmarks and runtimes vary based on student device CPU capabilities (e.g., low-end smartphone vs. high-end workstation). | Runtimes are evaluated directly on the student's hardware. | Standardize execution timing relative to baseline iterations or use server-side sandboxed runners for formal competitive coding contests. |
| **Memory Isolation Ceiling** | Browser tabs enforce standard memory constraints (~500MB to 1GB per tab depending on browser). Highly intensive memory allocations may trigger browser tab crashes rather than graceful exceptions. | Browsers manage Web Worker memory limits at the OS process level. | Limit problem constraints to $N \le 10^5$ elements to keep memory footprints safely under 50MB. |

---

## 2. AI Assistant Integration Limitations

| Limitation | Impact | Architectural Reason | Production Recommendation |
| :--- | :--- | :--- | :--- |
| **Deterministic Rule-Based Guidance** | The AI Academic Copilot currently uses deterministic domain decision logic rather than an external LLM model. Queries outside recognized keywords fall back to structured academic mentorship templates. | Avoids unconfigured cloud API dependency failures and eliminates API billing overhead during development/testing. Responses are honestly labeled with `isModelGenerated: false`. | Connect a cloud provider API (e.g., Gemini 1.5 Flash or OpenAI) with environment variable secrets, server-side caching, and cost quotas for open-ended queries. |
| **Context Window Size** | Context is passed as lightweight summary objects (e.g., student CGPA, course list) rather than full academic histories. | Prevents sending unnecessary student PII or bloating payload sizes. | Maintain sanitized, pseudonymized student profile context for LLM prompts when external model integration is enabled. |

---

## 3. Database & Persistence Scalability

| Limitation | Impact | Architectural Reason | Production Recommendation |
| :--- | :--- | :--- | :--- |
| **Single-Node vs. Atlas Replica Set** | Local development uses a single MongoDB instance; staging and production require Atlas cluster failover. | Local standalone instances have no replica consensus. | Deploy staging/production on a 3-node MongoDB Atlas replica set with automated point-in-time recovery and continuous backup. |
| **Stateless JWT Revocation Granularity** | If a user's role is modified or permissions changed without deactivating the account, old JWT claims remain active until token expiration (7 days). | Standard stateless JWTs do not query an in-memory session revocation store on every request. | Integrate a Redis token revocation blocklist or reduce access token lifespan to 15 minutes paired with rotating refresh tokens if instant role-change revocation is required. |
| **In-Memory File Upload Storage** | No cloud blob storage (e.g. AWS S3, Google Cloud Storage, Cloudinary) is currently configured for student resume PDFs or profile avatars. | CampusOne currently stores text-based portfolio and project records in MongoDB. | Integrate AWS S3 or Cloudinary SDK with pre-signed upload URLs for multi-megabyte resume PDF uploads and avatar images. |

---

## 4. Real-Time & Concurrency Considerations

| Limitation | Impact | Architectural Reason | Production Recommendation |
| :--- | :--- | :--- | :--- |
| **HTTP Polling vs. Real-Time WebSockets** | Attendance updates and exam submissions update state upon page load or API fetch rather than instant push notifications to connected clients. | Current implementation uses RESTful HTTP endpoints for all transactions. | Incorporate Socket.IO (or Server-Sent Events) for real-time live attendance roll calls and exam proctoring broadcasts. |
| **In-Memory Rate Limiting State** | `express-rate-limit` currently tracks request counts in server process memory. In a multi-instance PM2 cluster or horizontally scaled Docker swarm, rate limits are per-process rather than global. | In-memory store does not share counters across separate Node processes. | Configure `rate-limit-redis` with a shared Redis instance when scaling to multi-server production clusters. |
