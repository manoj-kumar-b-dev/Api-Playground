<div align="center">

  # 🚀 API Playground

  **AI-Powered API Workbench & Testing Platform**

  *A Postman-like full-stack API client featuring intelligent LLM response analysis, real-time HTTP debugging, mock sandboxes, workspace folder organization, and auto type generation.*

  [![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-5.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Enabled-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
  [![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

</div>

---

## 🌟 Overview

**API Playground** is a modern, developer-centric API testing & execution workbench built to bridge the gap between traditional API testing tools (like Postman or Insomnia) and artificial intelligence. 

Whether you are developing backend REST microservices, testing third-party APIs, or debugging unexpected status codes, API Playground delivers instantaneous HTTP execution, automatic JSON schema / TypeScript type generation, and AI-driven response explanations.

---

## ✨ Key Features

### 🤖 AI-Powered Response Intelligence & Debugging
- **Automated Response Explanation**: Summarize complex API payloads and payload keys with one click using Google Gemini or OpenAI LLMs.
- **Intelligent Debugging Assistance**: Detect `4xx` and `5xx` error codes and automatically generate root-cause analyses and step-by-step fix recommendations.
- **Privacy First & Data Masking**: Automatically redacts sensitive fields (`password`, `token`, `secret`, `authorization`) before sending data to AI providers.
- **Offline Fallback Engine**: Works even without an active AI API key by utilizing built-in rule heuristics.

### ⚡ Full HTTP Request Workbench
- **Supported Methods**: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, `HEAD`.
- **Dynamic Editors**:
  - Path Variables & Query Parameters editor.
  - Custom Headers manager with toggles.
  - Multi-Authentication modes (Bearer Token, Basic Auth, API Key, OAuth2).
  - Flexible Request Body support (`JSON`, `Form-Data`, `x-www-form-urlencoded`, `Raw`, and File Uploads).

### 📁 Workspace & Hierarchical Folder Tree
- Organize APIs into **Projects** ➔ **Collections** ➔ **Folders** ➔ **Endpoints**.
- Favorite starring for rapid navigation.
- Real-time global fuzzy search and filtering across projects and requests.
- Endpoint duplication and batch organization.

### 🛠️ Built-in Mock Sandbox Server
- Built-in test routes for local end-to-end sandbox testing without external dependencies:
  - `/api/mock/ping` — Health check response.
  - `/api/mock/echo` — Request header, body, and parameter echoing.
  - `/api/mock/users` — Full Mock CRUD user management dataset.
  - `/api/mock/status/:code` — Custom HTTP status code tester (e.g., test `201`, `400`, `401`, `500`).
  - `/api/mock/delay/:seconds` — Network latency simulator for timeout testing.

### 🧩 Response Tools & Type Generators
- Pretty JSON Viewer with collapsible nodes.
- Raw text and status headers inspector.
- Performance metrics bar (Response time in `ms`, content size in `KB`, HTTP status badges).
- **TypeScript Interface Generator**: Auto-generates ready-to-use TypeScript interfaces from live JSON responses.
- **JSON Schema Generator**: Instantly drafts JSON schema definitions.

### 🔐 Auth & Security
- Secure JWT-based authentication with cookie & header support.
- Google OAuth 2.0 single sign-on (`@react-oauth/google`).
- Password reset flow via Nodemailer email dispatch.
- Security headers using `Helmet` and API Rate Limiting using `express-rate-limit`.

### 🎨 Premium UI/UX
- Smooth animations powered by **Framer Motion**.
- Dark & Light mode themes with instant toggle (`ThemeToggle`).
- Responsive layout built with **Tailwind CSS v4** & modern UI components.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Core**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4, Framer Motion, Lucide React Icons
- **State Management & Querying**: Zustand, TanStack React Query v5
- **Form Validation**: React Hook Form, Zod schema validation
- **HTTP Client**: Axios
- **OAuth**: `@react-oauth/google`

### Backend (`/server`)
- **Runtime**: Node.js, Express 5, TypeScript (`tsx` / `ts-node-dev`)
- **Database**: MongoDB, Mongoose ORM
- **Authentication**: JWT (`jsonwebtoken`), BcryptJS, Google Auth Library
- **Security & Logging**: Helmet, CORS, Express Rate Limit, Winston Logger, Morgan
- **Email Service**: Nodemailer
- **AI Integration**: Google Generative AI API (Gemini 2.5 Flash, 1.5 Flash), OpenAI API fallback

---

## 📂 Project Structure

```text
API Playground/
├── client/                     # Vite + React 19 Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components (Request, Response, Modals, Forms)
│   │   ├── pages/              # Page views (Dashboard, Projects, Collections, Apis, Auth)
│   │   ├── stores/             # Zustand global state stores
│   │   ├── services/           # Axios API services
│   │   ├── types/              # TypeScript interfaces and types
│   │   ├── App.tsx             # Main App Router setup
│   │   └── main.tsx            # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Node.js + Express 5 Backend
│   ├── controllers/            # Route request handlers (Auth, Project, Collection, AI, Mock)
│   ├── models/                 # Mongoose schemas (User, Project, Collection, Endpoint, Folder)
│   ├── routes/                 # Express API route endpoints
│   ├── services/               # Core business logic & Gemini/OpenAI AI Service
│   ├── middlewares/            # Auth protection, Rate limiter, Error handling
│   ├── validators/             # Zod schema request payload validators
│   ├── app.ts                  # Express application setup
│   ├── server.ts               # Server listener initialization
│   └── package.json
│
├── docs/                       # Project Documentation
│   └── API_DOCUMENTATION.md    # Detailed REST API endpoint specification
└── README.md                   # Repository overview & setup guide
```

---

## ⚙️ Installation & Setup

### Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: `v18.x` or higher
- **npm** or **yarn**
- **MongoDB**: Local MongoDB instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.

---

### 1. Clone the Repository
```bash
git clone https://github.com/manoj-kumar-b-dev/Api-Playground.git
cd "API Playground"
```

---

### 2. Backend Setup (`/server`)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory (refer to `.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/api-playground?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d

   CLIENT_URL=http://localhost:5173

   # Nodemailer SMTP Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password

   # AI Integration (Google Gemini / OpenAI)
   GEMINI_API_KEY=your_gemini_api_key

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run at: `http://localhost:5000`

---

### 3. Frontend Setup (`/client`)

1. Open a new terminal tab and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at: `http://localhost:5173`

---

## 📡 API Endpoints Summary

All core endpoints are prefixed with `/api`. Protected routes require a `Bearer <token>` in the `Authorization` header.

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register a new user account |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| **Auth** | `POST` | `/api/auth/forgot-password` | Send password reset email |
| **Projects** | `GET` / `POST` | `/api/projects` | List or create workspace projects |
| **Collections**| `GET` / `POST` | `/api/collections` | List or create collections under projects |
| **Endpoints** | `POST` | `/api/endpoints/execute` | Execute an outbound HTTP request |
| **AI** | `POST` | `/api/ai/explain` | Analyze or debug response payload via LLM |
| **Mock** | `GET` | `/api/mock/ping` | Test backend server health |
| **Mock** | `GET` | `/api/mock/status/:code` | Simulate specific HTTP status code |
| **Mock** | `GET` | `/api/mock/delay/:sec` | Simulate network response delay |

> 📄 For the complete, interactive API documentation with sample request/response JSON payloads, view [docs/API_DOCUMENTATION.md](file:///e:/Full%20stack/React/Projects/API%20Playground%20%28%29/API%20Playground/docs/API_DOCUMENTATION.md).

---

## 🧪 Testing with Mock APIs

You can immediately start using API Playground without configuring third-party APIs by using the built-in mock endpoints:

1. Create a request with `GET http://localhost:5000/api/mock/users?role=developer`.
2. Send the request and explore the **Pretty JSON**, **TypeScript Types**, and **AI Explanation** tabs.
3. Test error handling by pointing to `GET http://localhost:5000/api/mock/status/404` and clicking **Debug with AI**.

---

## 🚀 Deployment

- **Frontend Deployment**: Can be deployed to [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), or Cloudflare Pages (`npm run build`).
- **Backend Deployment**: Ready for deployment on [Render](https://render.com/), [Railway](https://railway.app/), or Vercel Serverless Functions (`vercel.json` provided).

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">
  Made with ❤️ by Manoj Kumar
</div>
