const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/db');
const { errorHandler } = require('./middlewares/errorMiddleware');
const socketModule = require('./socket');

// Import all models to ensure they are registered before sync
require('./models/User');
require('./models/Course');
require('./models/Assignment');
require('./models/Submission');
require('./models/Announcement');
require('./models/LiveClass');
require('./models/Exam');
require('./models/QuestionBank');
require('./models/QuestionOption');
require('./models/ExamQuestion');
require('./models/ExamAttempt');
require('./models/StudentAnswer');
require('./models/Notification');
require('./models/Activity');
// New Models
require('./models/Enrollment');
require('./models/LessonProgress');
require('./models/Attendance');
require('./models/ExamResult');
require('./models/Certificate');
require('./models/Setting');
require('./models/Thread');
require('./models/Comment');
require('./models/ThreadView');
require('./models/ThreadUpvote');
require('./models/Batch');
require('./models/BatchStudent');
require('./models/Payment');
require('./models/Review');
require('./models/Note');

// Load Associations
require('./models/associations');

// Import route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const courseRoutes = require('./routes/course.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const submissionRoutes = require('./routes/submission.routes');
const certificateRoutes = require('./routes/certificate.routes');
const announcementRoutes = require('./routes/announcement.routes');
const liveClassRoutes = require('./routes/liveClass.routes');
const examRoutes = require('./routes/exam.routes');
const questionBankRoutes = require('./routes/questionBank.routes');
const uploadRoutes = require('./routes/upload.routes');
const notificationRoutes = require('./routes/notification.routes');
const activityRoutes = require('./routes/activity.routes');
const settingRoutes = require('./routes/setting.routes');
const contactRoutes = require('./routes/contact.routes');
const forumRoutes = require('./routes/forum.routes');
const moduleRoutes = require('./routes/module.routes');
const lessonRoutes = require('./routes/lesson.routes');
const batchRoutes = require('./routes/batch.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');
const noteRoutes = require('./routes/note.routes');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://brightmind-nine.vercel.app',
    'https://brightmind-git-main-nigamananda-7077s-projects.vercel.app'
];

// Initialize socket.io
socketModule.init(httpServer, allowedOrigins);

// ─── Middleware ────────────────────────────────────────────
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/question-bank', questionBankRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notes', noteRoutes);

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'BrightMind API is running 🚀' });
});

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL connected successfully');

        // Sync models
        await sequelize.sync({ alter: false });
        console.log('✅ Database synced (alter: false)');

        // One-time migration: change videoUrl from VARCHAR to TEXT
        try {
            await sequelize.query("ALTER TABLE lessons MODIFY COLUMN videoUrl TEXT;");
            console.log('✅ videoUrl column migrated to TEXT');
        } catch (migrationErr) {
            // Ignore if already TEXT or table doesn't exist yet
            console.log('ℹ️ videoUrl migration skipped:', migrationErr.message);
        }

        // One-time migration: create notes table
        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS notes (
                    id CHAR(36) PRIMARY KEY,
                    studentId CHAR(36) NOT NULL,
                    lessonId CHAR(36) NOT NULL,
                    content TEXT NOT NULL DEFAULT '',
                    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_student_lesson (studentId, lessonId)
                );
            `);
            console.log('✅ Notes table ready');
        } catch (notesErr) {
            console.log('ℹ️ Notes table migration skipped:', notesErr.message);
        }



        httpServer.listen(PORT, () => {
            console.log(`🚀 BrightMind server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to connect to database:', error.message);
        process.exit(1);
    }
};

startServer();
