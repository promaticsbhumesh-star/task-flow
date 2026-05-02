# ProjectPilot — MERN Project Management App

A full-stack project management web app with Role-Based Access Control (Admin & Member).

**Stack:** Node.js · Express.js · MongoDB Atlas · React.js · JWT

---

## Folder Structure

```
projectpilot/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── auth.js             ← JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── dashboard.js
│   ├── .env.example
│   ├── railway.json
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   └── Tasks.jsx
    │   ├── utils/
    │   │   └── api.js          ← axios instance with JWT
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# backend/.env
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/projectpilot
JWT_SECRET=your_random_secret_here
NODE_ENV=development
```

```bash
# frontend/.env
cp .env.example .env
```

Edit frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev       # starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev       # starts on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## API Endpoints

### Auth
| Method | Endpoint          | Access  | Description             |
|--------|-------------------|---------|-------------------------|
| POST   | /api/auth/signup  | Public  | Register user           |
| POST   | /api/auth/login   | Public  | Login, returns JWT      |
| GET    | /api/auth/me      | Auth    | Get current user        |
| GET    | /api/auth/users   | Admin   | List all users          |

### Projects
| Method | Endpoint                          | Access | Description       |
|--------|-----------------------------------|--------|-------------------|
| GET    | /api/projects                     | Auth   | List projects     |
| POST   | /api/projects                     | Admin  | Create project    |
| GET    | /api/projects/:id                 | Auth   | Get project       |
| PUT    | /api/projects/:id                 | Admin  | Update project    |
| DELETE | /api/projects/:id                 | Admin  | Delete project    |
| POST   | /api/projects/:id/members         | Admin  | Add member        |
| DELETE | /api/projects/:id/members/:userId | Admin  | Remove member     |

### Tasks
| Method | Endpoint      | Access       | Description                     |
|--------|---------------|-------------|---------------------------------|
| GET    | /api/tasks    | Auth         | List tasks (filtered by role)   |
| POST   | /api/tasks    | Admin        | Create task                     |
| GET    | /api/tasks/:id| Auth         | Get task                        |
| PUT    | /api/tasks/:id| Auth (RBAC)  | Admin: all fields; Member: status only |
| DELETE | /api/tasks/:id| Admin        | Delete task                     |

### Dashboard
| Method | Endpoint       | Access | Description       |
|--------|----------------|--------|-------------------|
| GET    | /api/dashboard | Auth   | Get stats summary |

---

## Sample API Responses

### POST /api/auth/login
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Bhumesh Sharma",
    "email": "bhumesh@example.com",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /api/dashboard
```json
{
  "success": true,
  "stats": {
    "totalTasks": 12,
    "completedTasks": 5,
    "pendingTasks": 4,
    "inProgressTasks": 3,
    "overdueTasks": 2,
    "totalProjects": 3,
    "totalUsers": 8
  },
  "recentTasks": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "title": "Design homepage",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2024-02-01T00:00:00.000Z",
      "project": { "name": "Jan Awaaz" },
      "assignedTo": { "name": "Rahul Kumar" }
    }
  ]
}
```

### POST /api/tasks (Admin)
**Request:**
```json
{
  "title": "Build login API",
  "description": "Create POST /auth/login endpoint",
  "projectId": "64f1a2b3c4d5e6f7a8b9c0d3",
  "assignedTo": "64f1a2b3c4d5e6f7a8b9c0d4",
  "dueDate": "2024-02-15",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "task": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
    "title": "Build login API",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-02-15T00:00:00.000Z",
    "isOverdue": false,
    "project": { "_id": "...", "name": "Jan Awaaz" },
    "assignedTo": { "_id": "...", "name": "Rahul Kumar", "email": "rahul@example.com" }
  }
}
```

---

## Deployment on Railway

### Backend

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo, choose the `backend/` folder as root (or push just backend)
3. Add environment variables:
   - `MONGO_URI` → your MongoDB Atlas connection string
   - `JWT_SECRET` → any long random string
   - `NODE_ENV` → production
4. Railway auto-detects Node.js and runs `npm start`
5. Copy the generated Railway URL (e.g. `https://projectpilot-backend.up.railway.app`)

### Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set root directory to `frontend/`
3. Add environment variable:
   - `VITE_API_URL` → `https://your-railway-backend-url.up.railway.app/api`
4. Deploy — Vercel handles Vite builds automatically

---

## RBAC Summary

| Feature              | Admin | Member |
|----------------------|-------|--------|
| Create project       | ✅    | ❌     |
| Edit/delete project  | ✅    | ❌     |
| Add/remove members   | ✅    | ❌     |
| View all projects    | ✅    | Own only |
| Create task          | ✅    | ❌     |
| Delete task          | ✅    | ❌     |
| View tasks           | All  | Assigned only |
| Update task status   | ✅    | Own tasks only |
| Dashboard            | Full stats | Personal stats |

---

## Demo Walkthrough

1. **Sign up as Admin** → Go to `/signup`, pick role "Admin"
2. **Create a project** → Projects page → "+ New Project"
3. **Sign up as Member** in another tab/incognito
4. **Add member to project** → Projects → 👥 Members → add member
5. **Create a task** → Tasks → "+ New Task" → assign to member, set due date
6. **Log in as Member** → see only assigned tasks
7. **Update task status** → Tasks → "Update" button → change to "in-progress"
8. **Check dashboard** → see live stats update

---

## Tech Choices (Beginner Notes)

- **bcryptjs** — hashes passwords before saving (never store plain text passwords)
- **jsonwebtoken** — signs a token on login; client sends it with every request in `Authorization: Bearer <token>` header
- **mongoose** — makes working with MongoDB feel like objects/classes instead of raw queries
- **CORS** — allows the frontend (different port/domain) to talk to the backend
- **React Context** — global state for the logged-in user without needing Redux
- **Protected Routes** — redirects unauthenticated users to /login automatically
