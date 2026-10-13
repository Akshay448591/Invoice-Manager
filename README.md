# 📑 Invoice Manager

A modern, full-stack **MERN** (MongoDB, Express, React, Node.js) business invoicing and client management solution with an integrated client self-service portal, automated PDF generation, and streamlined 1-click cloud deployment.

---

## ✨ Features

### 🏢 Business Management
- **Dashboard Analytics**: Real-time revenue summaries, outstanding receivables, recent invoices, and business health metrics.
- **Client Management**: Complete CRUD operations for client directory with credential provisioning for client portal access.
- **Invoices & Quotes**:
  - Auto-incrementing document numbering (`INV-0001`, `QUO-0001`).
  - Multi-line item support with automatic subtotal, tax calculation, and discounts.
  - Convert approved quotes directly to invoices in one click.
  - Dynamic invoice status transitions (`draft` → `sent` → `partial` → `paid` / `cancelled`).
- **Automated PDF Export**: Server-side vector PDF generation using PDFKit with custom branding.
- **Payments & Expenses**:
  - Track payments directly linked to invoices with auto-balancing and status updates.
  - Log categorized business expenses with date tracking.
- **Catalog & Projects**:
  - Product/service catalog with predefined pricing and rates.
  - Project and task tracking linked to specific clients.

### 🌐 Client Portal
- Dedicated secure portal for clients to log in.
- View assigned quotes and invoices.
- Download PDF invoices and monitor payment history in real time.

### 🔒 Enterprise-Grade Security
- **Authentication**: JWT stored in `httpOnly`, `SameSite=lax` secure cookies (resistant to XSS and CSRF).
- **Password Hashing**: Salted hashing via `bcryptjs`.
- **Role-Based Access**: Strict separation between business owners and portal clients.
- **Tenant Isolation**: Data queries automatically scoped to authenticated business accounts.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios |
| **Backend** | Node.js, Express, Mongoose, PDFKit, Cookie-Parser, CORS |
| **Database** | MongoDB / MongoDB Atlas |
| **Infrastructure** | Unified Fullstack Architecture on Render (`render.yaml` Blueprint) |

---

## 📁 Repository Structure

```text
invoice-manager/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components & layouts
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── pages/              # Dashboard, Clients, Invoices, Portal, Auth
│   │   ├── utils/              # Formatting & date helpers
│   │   └── api.js              # Axios instance configured with credentials
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── vite.config.js          # Vite build & development proxy setup
├── server/                     # Express + Node.js API
│   ├── config/                 # MongoDB database connection
│   ├── controllers/            # Business logic (Auth, Invoices, Clients, etc.)
│   ├── middleware/             # JWT auth & route protection
│   ├── models/                 # Mongoose schemas (User, Client, Invoice, Payment, etc.)
│   ├── routes/                 # Express API routes
│   └── utils/                  # PDF generator & sequence numbering
├── package.json                # Root orchestration & unified build scripts
├── render.yaml                 # Infrastructure as Code (Render Blueprint)
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI

### 1. Clone & Install
```bash
git clone https://github.com/Akshay448591/Invoice-Manager.git
cd Invoice-Manager
```

Install dependencies for both client and server:
```bash
npm install --prefix client
npm install --prefix server
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/invoice?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Run Locally
Open two terminal windows:

```bash
# Terminal 1 - Backend Server (runs on :5000)
cd server
npm run dev

# Terminal 2 - Frontend Client (runs on :5173)
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## ☁️ Deployment on Render

This repository includes a pre-configured **`render.yaml`** blueprint for fully automated deployment.

### 1-Click Blueprint Deployment:
1. Push your repository to GitHub.
2. Sign in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** ➔ **Blueprint**.
4. Connect your **`Invoice-Manager`** repository.
5. In the configuration prompt, provide your **`MONGO_URI`** connection string.
6. Click **Apply**.

Render will automatically:
- Install all dependencies for both frontend and backend.
- Build production-ready Vite assets.
- Auto-generate a secure random `JWT_SECRET`.
- Launch the unified Express server serving the API and React SPA on a single HTTPS domain.

---

## 🔑 Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `MONGO_URI` | **Yes** | — | MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | — | Cryptographic secret for signing JWT auth tokens |
| `NODE_ENV` | No | `development` | Set to `production` in live environments |
| `PORT` | No | `5000` | Server listening port (auto-set by Render) |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration duration |
| `CLIENT_URL` | No | — | Allowed CORS origin (not required when unified) |
| `COOKIE_SAME_SITE` | No | `lax` | Cookie SameSite policy (`lax` for same-origin) |

---

## 📡 API Overview

### Authentication
- `POST /api/auth/register` — Register business account
- `POST /api/auth/login` — Login (business or client)
- `POST /api/auth/logout` — Clear auth cookie
- `GET /api/auth/me` — Get current authenticated user profile

### Core Resources
- `GET/POST /api/clients` — Client directory management
- `GET/POST /api/invoices` — Invoice creation, updates, and balance recalculation
- `GET /api/invoices/:id/pdf` — Download generated PDF invoice
- `GET/POST /api/quotes` — Quote creation & convert-to-invoice
- `GET/POST /api/payments` — Log payment against invoices
- `GET/POST /api/expenses` — Business expense tracking
- `GET/POST /api/products` — Product & service catalog
- `GET/POST /api/projects` — Client project tracking
- `GET/POST /api/tasks` — Project tasks tracking

### Client Portal
- `GET /api/portal/summary` — Portal dashboard overview
- `GET /api/portal/invoices` — Client's invoice list
- `GET /api/portal/quotes` — Client's quote list

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
