# Task-Flow 🚀
### Full-Stack Project Management App | MERN Stack

A complete project management web application with Role-Based Access Control, built with the MERN stack and JWT authentication.

---

## 🔥 Live Demo
>https://task-flow-sigma-mocha.vercel.app
---

## ✨ Features

**Admin Role:**
- Create, edit, and delete projects
- Add or remove members from projects
- Create and assign tasks with due dates and priority levels
- Full dashboard with team-wide statistics
- Delete tasks

**Member Role:**
- View only assigned tasks
- Update task status (Pending → In Progress → Done)
- Personal dashboard with individual stats

**General:**
- JWT-based secure authentication
- Password hashing with bcrypt
- Protected routes (frontend + backend)
- Real-time overdue task detection
- Responsive dark UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| Deployment | Vercel (frontend), Railway (backend) |


---

## 🚀 Run Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)

### 1. Clone the repo
```bash
git clone https://github.com/Bhumesh5051/task-flow.git
cd task-flow
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGO_URI and JWT_SECRET in .env
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api in .env
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🔐 Role-Based Access Control

| Feature               |     Admin     | Member         |
|---------               |-------          |--------        |
| Create/delete projects | ✅              | ❌            |
| Manage members         | ✅              | ❌            |
| Create/assign tasks    | ✅              | ❌            |
| View tasks             | All tasks       | Own tasks only |
| Update task status     | ✅              | Own tasks only |
| Dashboard stats        | Full team stats | Personal stats |

---

## 📁 Project Structure

```
task-flow/
├── backend/
│   ├── controllers/    # Business logic
│   ├── middleware/     # JWT auth + role check
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   └── server.js
└── frontend/
    └── src/
        ├── components/ # Sidebar, ProtectedRoute
        ├── context/    # Auth state (React Context)
        ├── pages/      # Login, Signup, Dashboard, Projects, Tasks
        └── utils/      # Axios instance
```

---

## 👨‍💻 Author

**Bhumesh Sharma**
- GitHub: [@Bhumesh5051](https://github.com/Bhumesh5051)
- LinkedIn: [linkedin.com/in/bhumesh-sharma-68554231b](https://linkedin.com/in/bhumesh-sharma-68554231b)
