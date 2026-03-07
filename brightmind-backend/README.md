# BrightMind LMS Backend

This is the Node.js + Express + MySQL backend for the BrightMind Learning Management System.

## Architecture
- **Framework**: Express.js
- **Database**: MySQL Connect via `mysql2` and `sequelize` ORM
- **Authentication**: JWT (JSON Web Tokens) + `bcryptjs`
- **File Uploads**: `multer`

## Folder Structure

```text
brightmind-backend/
├── config/           # Database configuration (db.js)
├── controllers/      # Route logic (to be added)
├── models/           # Sequelize Models (User, Course, etc.)
├── routes/           # Express routes mapping to controllers
├── uploads/          # Local dir to store uploaded files
├── .env              # Environment vars (You must create this from .env.example)
├── package.json      # Dependencies
└── server.js         # Main application entry point
```

## How to Start

### 1. Database Setup
1. Ensure you have **MySQL** installed and running on your machine (e.g., via XAMPP, WAMP, or standalone).
2. Create a database called `brightmind_db`:
   ```sql
   CREATE DATABASE brightmind_db;
   ```

### 2. Environment Configuration
1. Rename `.env.example` to `.env`.
2. Update the `.env` file with your MySQL root password:
   ```env
   DB_PASSWORD=your_mysql_password_here
   ```

### 3. Install & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server (Development mode with nodemon):
   ```bash
   npm run dev
   ```

Upon starting, Sequelize will automatically connect to your MySQL database and create the necessary tables (`sync({ alter: true })`).

The server will run on `http://localhost:5000`. You can test it by visiting `http://localhost:5000/api/health`.
