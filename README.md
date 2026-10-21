# Invoice Manager: Enterprise Invoicing, Client Portal, and Observability Platform

A full-stack business invoicing and client relationship management system built on the MERN stack (MongoDB, Express, React, Node.js). The application provides automated invoice generation, quote-to-invoice conversions, server-side vector PDF generation, a dedicated client self-service portal, multi-tier automated test suites, production containerization with Docker, and end-to-end continuous integration and deployment (CI/CD) pipelines.

---

## 1. System Architecture and Design Patterns

### Architectural Overview
The platform employs a decoupled client-server architecture designed for high maintainability, low operational latency, and scalable multi-tenant execution:

* **Presentation Layer (Frontend)**: Single-page application (SPA) built with React 18 and Vite. State is managed through focused React Context providers (`AuthContext`, `ToastContext`), styled with Tailwind CSS, and bundled for production with tree-shaking and asset hashing.
* **Application Layer (Backend API)**: Stateless Express.js REST API operating on Node.js 22. It orchestrates business transactions, handles authentication and authorization, enforces schema validation, streams dynamically rendered PDFs, and collects telemetry.
* **Persistence Layer (Database)**: MongoDB with Mongoose ODM for object modeling. Utilizes schema validation, compound indexing, atomic sequence counters, and virtual population.
* **Reverse Proxy and Static Asset Hosting**: In containerized production, Nginx acts as an edge reverse proxy routing `/api` traffic to the Node backend while serving static assets with gzip compression and aggressive caching.

### Key Design Patterns

* **CRUD Factory Pattern**: Standardizes common resource operations (pagination, sorting, ownership filtering, population, authorization checks, and error responses) across Products, Projects, Tasks, Expenses, and Payments via `server/controllers/crudFactory.js`, eliminating redundant controller boilerplate.
* **Snapshot Pattern for Invoicing**: When invoices or quotes are created, product names and unit prices are snapshot into the document line items (`server/models/lineItems.js`). Subsequent edits to the product catalog never modify previously issued financial records.
* **Atomic Sequential Numbering**: Document numbers (`INV-0001`, `QUO-0001`) are generated atomically using MongoDB's `$inc` operator on a dedicated `Counter` collection scoped by owner and document type, avoiding race conditions and duplicate invoice numbers under concurrent load.
* **Correlation ID Propagation**: Incoming requests receive an `X-Request-Id` UUID v4 header that propagates through all internal loggers, database queries, and response headers for distributed request tracing.

---

## 2. Core Business Capabilities

### Business Administration
* **Analytical Dashboard**: Summarizes net revenue, outstanding receivables, unpaid invoices, recent transactions, and month-over-month performance.
* **Client Directory Management**: Complete CRUD operations for client companies with contact information, billing addresses, and linked portal user accounts.
* **Invoice Lifecycle Management**:
  * Status transitions: `draft` -> `sent` -> `partial` -> `paid` / `cancelled`.
  * Automatic computation of subtotals, configurable tax percentages, discounts, and outstanding balances.
  * Editing protections: Paid and cancelled invoices are immutably locked against modification.
* **Quotes and Estimates**:
  * Estimation workflow with validity expiration dates.
  * Direct quote-to-invoice conversion with line items and client references transferred atomically.
* **Payment Recording**: Payment entries linked directly to invoices with balance recalculation and status advancement.
* **Dynamic Vector PDF Generation**: Server-side PDF generation using PDFKit, streaming vector invoices with custom corporate branding and itemized breakdowns without temporary disk storage.
* **Product Catalog and Project Tracking**: Predefined product rates and service fees with project-specific task tracking.

### Client Self-Service Portal
* **Dedicated Client Role (`client`)**: Client accounts access a restricted portal view (`/portal`) scoped exclusively to their issued documents.
* **Document Review and Responses**: Clients can review estimates, download official PDF invoices, and accept or decline quotes in real time.
* **Draft Isolation**: Unfinalized draft invoices and internal business records are excluded from client queries at the database layer.

---

## 3. Security Architecture

* **Authentication and Session Management**: JSON Web Tokens (JWT) signed with HMAC-SHA256. Tokens are transmitted exclusively inside `httpOnly`, `SameSite=Lax`, secure cookies, neutralizing client-side Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) vectors.
* **Cryptographic Password Hashing**: Passwords are salted and hashed using `bcryptjs` with 10 salt rounds. Passwords have `select: false` on the Mongoose schema to prevent accidental leakage in database queries.
* **Role-Based Access Control (RBAC)**: Route middleware validates authorization levels (`business` vs. `client`). Business endpoints reject client tokens with HTTP 403 Forbidden.
* **Multi-Tenant Data Segregation**: Every database query on the business administration side includes `owner: req.user._id`, ensuring tenants cannot read, modify, or delete another organization's records.
* **Input Sanitization**: Express JSON body parsers coupled with Mongoose schema-level validation enforce required types, length boundaries, and minimum values.

---

## 4. Observability and Telemetry

The platform implements the Three Pillars of Observability (Logs, Metrics, Traces) along with health monitoring:

### Structured Logging (Pino)
* High-throughput JSON logging with ISO timestamps and configurable log levels (`LOG_LEVEL`).
* Automatic HTTP request logging using `pino-http`, capturing request methods, routes, status codes, response durations in milliseconds, and client IP addresses.
* Correlation IDs (`X-Request-Id`) injected into every log entry for unified log tracking.

### Application and Business Metrics (Prometheus)
* Exposed via `GET /api/metrics` using `prom-client` in standard Prometheus text format.
* **System & Runtime Metrics**: Process CPU utilization, heap memory usage, active event loop lag, and garbage collection pauses.
* **HTTP RED Metrics (Rate, Errors, Duration)**:
  * `invoice_manager_http_requests_total`: Counter tracking total requests labeled by HTTP method, route, and status code.
  * `invoice_manager_http_request_duration_seconds`: Latency histogram with buckets at 10ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s, and 10s.
* **Custom Domain Metrics**:
  * `invoice_manager_invoices_created_total`: Counter tracking invoices created by status.
  * `invoice_manager_payments_amount_total`: Cumulative revenue recorded in currency units.
  * `invoice_manager_pdf_generation_duration_seconds`: Latency histogram measuring PDF rendering durations.

### Distributed Tracing (OpenTelemetry)
* Configured in `server/tracing.js` using OpenTelemetry NodeSDK.
* Auto-instruments Express routes and outgoing HTTP requests with standard W3C `traceparent` headers, facilitating trace aggregation in Jaeger, Grafana Tempo, or Datadog.

### Health Probes
* `GET /api/health`: Basic service operational status.
* `GET /api/health/live`: Liveness probe measuring process uptime and heap memory consumption.
* `GET /api/health/ready`: Readiness probe verifying downstream dependency availability by inspecting active MongoDB connectivity (`mongoose.connection.readyState === 1`). Returns HTTP 503 if disconnected.
* `POST /api/health/telemetry/errors`: Ingestion endpoint for client-side React ErrorBoundary crash reports.

---

## 5. Multi-Tier Automated Testing Suite

The repository contains automated tests spanning Unit, Integration, and End-to-End browser tiers. All tests run in isolated environments without cross-test state leakage.

### Test Architecture

| Tier | Framework | Scope | Total Tests |
| :--- | :--- | :--- | :--- |
| **Backend Unit** | Vitest | Calculation math, rounding, and atomic numbering utilities | 9 Tests |
| **Backend Integration** | Vitest + Supertest | Auth lifecycle, RBAC, Invoices CRUD, PDF streaming, Metrics, and Health probes | 19 Tests |
| **Frontend Unit & Component** | Vitest + React Testing Library + JSDOM | Formatting utilities, StatusBadge, EmptyState, and ProtectedRoute guards | 18 Tests |
| **End-to-End (E2E)** | Playwright (Chromium) | Full browser journeys: Auth, route guards, client onboarding, and invoice lifecycle | 3 Workflows |
| **Total Automated Tests** | | | **49 Tests (100% Passing)** |

### Verified Test Results

```text
Server Test Execution (Vitest):
- test/unit/lineItems.test.js: 6 passed
- test/unit/nextNumber.test.js: 3 passed
- test/integration/auth.test.js: 9 passed
- test/integration/invoices.test.js: 4 passed
- test/integration/observability.test.js: 6 passed
Total Server Tests: 28 passed (28 tests across 5 suites)

Client Test Execution (Vitest):
- src/test/unit/format.test.js: 6 passed
- src/test/components/StatusBadge.test.jsx: 5 passed
- src/test/components/EmptyState.test.jsx: 3 passed
- src/test/components/ProtectedRoute.test.jsx: 4 passed
Total Client Tests: 18 passed (18 tests across 4 suites)

End-to-End Test Execution (Playwright):
- e2e/auth-flow.spec.js (Route protection): passed
- e2e/auth-flow.spec.js (Registration, logout, login): passed
- e2e/client-invoice-flow.spec.js (Client creation, invoice drafting, calculations): passed
Total E2E Workflows: 3 passed (3 workflows across 2 suites)
```

### Running the Test Suites

```bash
# Execute all Unit and Integration tests (Server + Client)
npm test

# Execute backend tests with coverage
npm run test:server

# Execute frontend component tests with coverage
npm run test:client

# Execute Playwright End-to-End tests
npm run test:e2e

# Generate test coverage reports
npm run test:coverage
```

---

## 6. Performance Benchmarks and Measurements

* **Production Bundle Footprint**:
  * Frontend HTML: 0.66 kB (gzip: 0.37 kB)
  * CSS Bundle: 24.26 kB (gzip: 5.23 kB)
  * JavaScript Application Bundle: 284.56 kB (gzip: 90.62 kB)
  * Total initial network payload: ~96 kB compressed.
* **API Response Latencies**:
  * Health / Liveness Check: < 2 ms
  * Authentication Verification (`/api/auth/me`): 3-6 ms
  * Document List with Population (`/api/invoices`): 8-15 ms
* **PDF Generation Latency**:
  * Typical multi-item invoice vector PDF render: 12-25 ms
  * Direct stream to HTTP response with zero intermediate filesystem I/O.
* **Test Suite Execution Speed**:
  * Frontend Unit/Component suite: ~1.5s total test execution.
  * Backend Unit/Integration suite: ~10s total test execution.
  * Full Playwright E2E browser suite: ~24s across all flows.

---

## 7. Containerization and Docker Architecture

The project supports both unified production containerization and multi-container local development:

### Unified Production Container (`Dockerfile`)
* **Multi-Stage Architecture**:
  * `Stage 1 (client-builder)`: Compiles React assets using Node 22 Alpine.
  * `Stage 2 (runner)`: Minimal Node 22 Alpine runtime. Copies production dependencies (`npm ci --omit=dev`), the server source code, and compiled frontend assets into `/app/client/dist`.
* **Security Hardening**:
  * Runs under an unprivileged system user (`appuser:appgroup`).
  * Integrates `dumb-init` as PID 1 to ensure proper UNIX signal forwarding (`SIGTERM`, `SIGINT`) and zombie process reaping.
  * Internal container healthcheck polling `/api/health`.

### Local Multi-Container Development (`docker-compose.yml`)
Orchestrates the entire platform locally with isolated networking:
* **Frontend**: Nginx Alpine serving React static files and reverse-proxying `/api` requests (`http://localhost:80`).
* **Backend**: Express API service running on Node 22 (`http://localhost:5000`).
* **Database**: Official MongoDB 6.0 service with persistent volume storage (`localhost:27017`).

```bash
# Start all services with Docker Compose
docker compose up --build

# Build the unified production container image
docker build -t invoice-manager:latest .

# Run the unified production container
docker run -p 5000:5000 \
  -e MONGO_URI="mongodb+srv://..." \
  -e JWT_SECRET="your-secret-key" \
  invoice-manager:latest
```

---

## 8. Continuous Integration and Deployment (CI/CD)

The repository uses a four-stage GitHub Actions pipeline defined in `.github/workflows/ci-cd.yml`:

1. **Security and Secret Auditing (`security-audit`)**:
   * Scans commit history using **Gitleaks** to prevent credential and secret leakage.
   * Performs an automated `npm audit` on production dependencies to detect critical CVE advisories.
2. **Automated Testing and Coverage (`test`)**:
   * Initializes a MongoDB 6.0 service container on the runner.
   * Compiles the frontend to verify zero asset bundling or syntax errors.
   * Executes backend Unit & Integration tests with V8 coverage.
   * Executes frontend Component tests with V8 coverage.
   * Installs Playwright Chromium and executes headless End-to-End browser tests.
   * Publishes an automated Markdown Test Summary to the GitHub Actions run overview.
   * Uploads coverage reports and Playwright failure traces as downloadable artifacts.
3. **Docker Verification and Live Smoke Testing (`docker-validation`)**:
   * Builds the multi-stage production Docker image.
   * Launches the container in the background and probes `http://localhost:5000/api/health` with automated retries to verify real-world container boot and traffic readiness.
   * Builds standalone frontend and backend images.
4. **Automated Render Deployment (`deploy`)**:
   * Executes on pushes to the `main` branch after all quality gates pass.
   * Triggers the Render Deploy Hook via authenticated HTTP POST request to redeploy the live service.

---

## 9. API Reference

### Health and Telemetry
* `GET /api/health` — Basic service status.
* `GET /api/health/live` — Liveness check reporting uptime and memory heap metrics.
* `GET /api/health/ready` — Readiness check validating active database connectivity.
* `POST /api/health/telemetry/errors` — Client ErrorBoundary crash ingestion.
* `GET /api/metrics` — Prometheus text format metrics scrape endpoint.

### Authentication
* `POST /api/auth/register` — Register a business user account.
* `POST /api/auth/login` — Authenticate and receive `httpOnly` session cookie.
* `POST /api/auth/logout` — Clear authentication cookie.
* `GET /api/auth/me` — Retrieve current authenticated user profile.

### Business Resources
* `GET, POST /api/clients` — Client directory listing and creation.
* `GET, PUT, DELETE /api/clients/:id` — Retrieve, update, or delete a client.
* `GET, POST /api/invoices` — List invoices and create new drafts.
* `GET, PUT, DELETE /api/invoices/:id` — Retrieve, update, or delete an invoice.
* `POST /api/invoices/:id/send` — Transition invoice status from draft to sent.
* `POST /api/invoices/:id/cancel` — Cancel an unpaid invoice.
* `GET /api/invoices/:id/pdf` — Stream generated vector PDF invoice.
* `GET, POST /api/quotes` — Estimate and quote management.
* `POST /api/quotes/:id/convert` — Atomically convert an accepted quote into an invoice.
* `GET, POST /api/payments` — Record invoice payments with balance reconciliation.
* `GET, POST /api/products` — Product catalog management.
* `GET, POST /api/projects` — Client project tracking.
* `GET, POST /api/tasks` — Project tasks tracking.
* `GET, POST /api/expenses` — Business expense tracking.

### Client Portal
* `GET /api/portal/invoices` — List invoices belonging to the authenticated client.
* `GET /api/portal/invoices/:id` — Retrieve detailed client invoice.
* `GET /api/portal/invoices/:id/pdf` — Download client invoice PDF.
* `GET /api/portal/quotes` — List quotes belonging to the authenticated client.
* `POST /api/portal/quotes/:id/respond` — Accept or decline an issued quote.

---

## 10. Local Development Setup

### Prerequisites
* Node.js v20 or higher
* npm v10 or higher
* MongoDB local instance or MongoDB Atlas connection string
* Docker and Docker Compose (optional for containerized execution)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Akshay448591/Invoice-Manager.git
cd Invoice-Manager
```

2. Install dependencies:
```bash
npm install
npm install --prefix client
npm install --prefix server
```

3. Configure environment variables in `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/invoice
JWT_SECRET=your-secure-random-jwt-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
COOKIE_SAME_SITE=lax
LOG_LEVEL=info
```

4. Start development servers:
```bash
# Terminal 1: Backend API (nodemon)
npm run server

# Terminal 2: Frontend Client (Vite)
npm run client
```

Application will be available at `http://localhost:5173`.

---

## 11. Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | No | `5000` | HTTP port on which the Express API server listens |
| `NODE_ENV` | No | `development` | Environment mode (`development`, `production`, `test`) |
| `MONGO_URI` | Yes | — | MongoDB Atlas or local connection URI |
| `TEST_MONGO_URI` | No | — | Dedicated test database URI used during CI and testing |
| `JWT_SECRET` | Yes | — | Cryptographic secret for signing session tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token validity duration |
| `CLIENT_URL` | No | — | Allowed CORS origin in development |
| `COOKIE_SAME_SITE` | No | `lax` | SameSite cookie policy attribute |
| `LOG_LEVEL` | No | `info` | Minimum log level for Pino logger (`debug`, `info`, `warn`, `error`) |
| `ENABLE_TRACING` | No | `false` | Enables OpenTelemetry distributed tracing when set to `true` |
| `RENDER_DEPLOY_HOOK_URL`| No | — | Webhook URL for automated deployment triggering in CI |

---

## 12. License

This project is licensed under the MIT License.
