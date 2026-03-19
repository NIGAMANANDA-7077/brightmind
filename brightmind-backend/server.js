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
require('./models/EnrollmentRequest');
require('./models/AdminActivityLog');
require('./models/Tenant');

// Load Associations
require('./models/associations');

const enrollmentRequestRoutes = require('./routes/enrollmentRequest.routes');
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
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');
const adminRoutes = require('./routes/admin.routes');
const superadminRoutes = require('./routes/superadmin.routes');

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

app.use('/api/enrollment-requests', enrollmentRequestRoutes);
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
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superadminRoutes);

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

        // One-time migration: ensure studentId column exists on Users table
        try {
            await sequelize.query("ALTER TABLE Users ADD COLUMN studentId VARCHAR(255) NULL UNIQUE;");
            console.log('✅ studentId column added to Users');
        } catch (studentIdErr) {
            // Error 1060 = Duplicate column (already exists), safe to ignore
            console.log('ℹ️ studentId column migration skipped:', studentIdErr.message);
        }

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



        // One-time migration: Add Assignment columns (description, teacherId, allowLateSubmission)
        try {
            await sequelize.query("ALTER TABLE Assignments ADD COLUMN description TEXT NULL;");
            console.log('✅ Assignments.description column added');
        } catch (e) { console.log('ℹ️ Assignments.description migration skipped:', e.message); }
        try {
            await sequelize.query("ALTER TABLE Assignments ADD COLUMN teacherId CHAR(36) NULL;");
            console.log('✅ Assignments.teacherId column added');
        } catch (e) { console.log('ℹ️ Assignments.teacherId migration skipped:', e.message); }
        try {
            await sequelize.query("ALTER TABLE Assignments ADD COLUMN allowLateSubmission TINYINT(1) NOT NULL DEFAULT 0;");
            console.log('✅ Assignments.allowLateSubmission column added');
        } catch (e) { console.log('ℹ️ Assignments.allowLateSubmission migration skipped:', e.message); }

        // One-time migration: Add Submission columns (feedback, comment, Late status)
        try {
            await sequelize.query("ALTER TABLE Submissions ADD COLUMN feedback TEXT NULL;");
            console.log('✅ Submissions.feedback column added');
        } catch (e) { console.log('ℹ️ Submissions.feedback migration skipped:', e.message); }
        try {
            await sequelize.query("ALTER TABLE Submissions ADD COLUMN comment TEXT NULL;");
            console.log('✅ Submissions.comment column added');
        } catch (e) { console.log('ℹ️ Submissions.comment migration skipped:', e.message); }

        // One-time migration: Update role ENUM to include SuperAdmin
        try {
            await sequelize.query("ALTER TABLE Users MODIFY COLUMN role ENUM('Student', 'Teacher', 'Admin', 'SuperAdmin') DEFAULT 'Student';");
            console.log('✅ Users.role ENUM updated to include SuperAdmin');
        } catch (e) {
            console.log('ℹ️ Users.role migration skipped:', e.message);
        }
        try {
            await sequelize.query("ALTER TABLE Submissions MODIFY COLUMN status ENUM('Pending','Submitted','Late','Graded') NOT NULL DEFAULT 'Pending';");
            console.log('✅ Submissions.status ENUM updated');
        } catch (e) { console.log('ℹ️ Submissions.status migration skipped:', e.message); }

        // One-time migration: Notification userId + type ENUM update
        try {
            await sequelize.query("ALTER TABLE Notifications ADD COLUMN userId CHAR(36) NULL;");
            console.log('✅ Notifications.userId column added');
        } catch (e) { console.log('ℹ️ Notifications.userId migration skipped:', e.message); }
        try {
            await sequelize.query("ALTER TABLE Notifications ADD COLUMN link VARCHAR(255) NULL;");
            console.log('✅ Notifications.link column added');
        } catch (e) { console.log('ℹ️ Notifications.link migration skipped:', e.message); }
        try {
            await sequelize.query("ALTER TABLE Notifications MODIFY COLUMN type ENUM('info','success','warning','error','announcement','assignment','exam','discussion') NOT NULL DEFAULT 'info';");
            console.log('✅ Notifications.type ENUM updated');
        } catch (e) { console.log('ℹ️ Notifications.type ENUM migration skipped:', e.message); }

        // One-time cleanup: delete old broadcast notifications (userId = NULL) from the old system
        // These are legacy "Welcome!", "Exam Pending" etc. shown incorrectly to all users
        try {
            const [result] = await sequelize.query("DELETE FROM Notifications WHERE userId IS NULL;");
            console.log('✅ Old broadcast notifications cleaned up');
        } catch (e) { console.log('ℹ️ Notification cleanup skipped:', e.message); }

        // Course table migrations: price + slug
        try {
            await sequelize.query("ALTER TABLE Courses ADD COLUMN price DECIMAL(10,2) NULL DEFAULT 0;");
            console.log('✅ Courses.price column added');
        } catch (e) { console.log('ℹ️ Courses.price migration skipped:', e.message); }
        try {
            await sequelize.query("ALTER TABLE Courses ADD COLUMN slug VARCHAR(255) NULL;");
            console.log('✅ Courses.slug column added');
        } catch (e) { console.log('ℹ️ Courses.slug migration skipped:', e.message); }

        // EnrollmentRequests table migration
        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS EnrollmentRequests (
                    id CHAR(36) PRIMARY KEY,
                    courseId CHAR(36) NOT NULL,
                    studentId CHAR(36) NOT NULL,
                    message TEXT NULL,
                    status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
                    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_student_course (studentId, courseId)
                );
            `);
            console.log('✅ EnrollmentRequests table ready');
        } catch (e) { console.log('ℹ️ EnrollmentRequests table migration skipped:', e.message); }

        // Update Notification type ENUM to include success/error for enrollment notifications
        try {
            await sequelize.query("ALTER TABLE Notifications MODIFY COLUMN type ENUM('info','success','warning','error','announcement','assignment','exam','discussion') NOT NULL DEFAULT 'info';");
            console.log('✅ Notifications.type ENUM updated with success/error');
        } catch (e) { console.log('ℹ️ Notifications.type ENUM update skipped:', e.message); }

        // One-time migration: create admin_activity_logs table
        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS admin_activity_logs (
                    id CHAR(36) PRIMARY KEY,
                    adminId CHAR(36) NOT NULL,
                    actionType ENUM('CREATE_COURSE','UPDATE_COURSE','DELETE_COURSE','CREATE_EXAM','UPDATE_EXAM','DELETE_EXAM','CREATE_BATCH','UPDATE_BATCH','ASSIGN_BATCH','CREATE_USER','UPDATE_USER','DELETE_USER','UPDATE_SETTINGS','CREATE_ANNOUNCEMENT','OTHER') NOT NULL DEFAULT 'OTHER',
                    actionDescription TEXT NOT NULL,
                    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_adminId (adminId)
                );
            `);
            console.log('✅ admin_activity_logs table ready');
        } catch (e) { console.log('ℹ️ admin_activity_logs migration skipped:', e.message); }

        // One-time migration: add lastLoginAt to Users
        try {
            await sequelize.query("ALTER TABLE Users ADD COLUMN lastLoginAt DATETIME NULL;");
            console.log('✅ Users.lastLoginAt column added');
        } catch (e) { console.log('ℹ️ Users.lastLoginAt migration skipped:', e.message); }

        // One-time migration: update admin_activity_logs with new columns (moduleName, ipAddress, description)
        try {
            await sequelize.query("ALTER TABLE admin_activity_logs ADD COLUMN moduleName VARCHAR(50) NULL;");
            console.log('✅ admin_activity_logs.moduleName column added');
        } catch (e) { console.log('ℹ️ admin_activity_logs.moduleName migration skipped:', e.message); }
        try {
            await sequelize.query("ALTER TABLE admin_activity_logs ADD COLUMN ipAddress VARCHAR(45) NULL;");
            console.log('✅ admin_activity_logs.ipAddress column added');
        } catch (e) { console.log('ℹ️ admin_activity_logs.ipAddress migration skipped:', e.message); }
        try {
            await sequelize.query("ALTER TABLE admin_activity_logs ADD COLUMN `description` TEXT NULL;");
            console.log('✅ admin_activity_logs.description column added');
        } catch (e) { console.log('ℹ️ admin_activity_logs.description migration skipped:', e.message); }
        // Migrate existing actionDescription values to description
        try {
            await sequelize.query("UPDATE admin_activity_logs SET `description` = actionDescription WHERE `description` IS NULL AND actionDescription IS NOT NULL;");
            console.log('✅ admin_activity_logs.description populated from actionDescription');
        } catch (e) { console.log('ℹ️ admin_activity_logs description migration skipped:', e.message); }
        // Update actionType ENUM to use simplified values
        try {
            // First remap old combined values to new simple values
            await sequelize.query("UPDATE admin_activity_logs SET actionType = 'CREATE' WHERE actionType IN ('CREATE_COURSE','CREATE_EXAM','CREATE_BATCH','CREATE_USER','CREATE_ANNOUNCEMENT');");
            await sequelize.query("UPDATE admin_activity_logs SET actionType = 'UPDATE' WHERE actionType IN ('UPDATE_COURSE','UPDATE_EXAM','UPDATE_BATCH','UPDATE_USER','UPDATE_SETTINGS');");
            await sequelize.query("UPDATE admin_activity_logs SET actionType = 'DELETE' WHERE actionType IN ('DELETE_COURSE','DELETE_EXAM','DELETE_BATCH','DELETE_USER');");
            await sequelize.query("UPDATE admin_activity_logs SET actionType = 'ASSIGN' WHERE actionType IN ('ASSIGN_BATCH');");
            // Alter ENUM to simplified values
            await sequelize.query("ALTER TABLE admin_activity_logs MODIFY COLUMN actionType ENUM('CREATE','UPDATE','DELETE','ASSIGN','OTHER') NOT NULL DEFAULT 'OTHER';");
            console.log('✅ admin_activity_logs.actionType ENUM updated to simplified values');
        } catch (e) { console.log('ℹ️ admin_activity_logs.actionType migration skipped:', e.message); }
        // Set description NOT NULL after migration
        try {
            await sequelize.query("UPDATE admin_activity_logs SET `description` = 'Action performed' WHERE `description` IS NULL OR `description` = '';");
            await sequelize.query("ALTER TABLE admin_activity_logs MODIFY COLUMN `description` TEXT NOT NULL;");
            console.log('✅ admin_activity_logs.description set NOT NULL');
        } catch (e) { console.log('ℹ️ admin_activity_logs.description NOT NULL migration skipped:', e.message); }

        // One-time migration: add mustChangePassword column to users
        try {
            await sequelize.query("ALTER TABLE users ADD COLUMN mustChangePassword TINYINT(1) NOT NULL DEFAULT 0;");
            console.log('✅ users.mustChangePassword column added');
        } catch (e) { console.log('ℹ️ users.mustChangePassword migration skipped:', e.message); }

        // ─── Multi-Tenant Migrations ─────────────────────────────────────────
        // Create tenants table
        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS tenants (
                    id CHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    createdBy CHAR(36) NULL,
                    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                );
            `);
            console.log('✅ tenants table ready');
        } catch (e) { console.log('ℹ️ tenants table migration skipped:', e.message); }
        // Add tenantId to Users
        try {
            await sequelize.query("ALTER TABLE Users ADD COLUMN tenantId CHAR(36) NULL;");
            console.log('✅ Users.tenantId column added');
        } catch (e) { console.log('ℹ️ Users.tenantId migration skipped:', e.message); }
        // Add tenantId to Courses
        try {
            await sequelize.query("ALTER TABLE Courses ADD COLUMN tenantId CHAR(36) NULL;");
            console.log('✅ Courses.tenantId column added');
        } catch (e) { console.log('ℹ️ Courses.tenantId migration skipped:', e.message); }
        // Add tenantId to batches
        try {
            await sequelize.query("ALTER TABLE batches ADD COLUMN tenantId CHAR(36) NULL;");
            console.log('✅ batches.tenantId column added');
        } catch (e) { console.log('ℹ️ batches.tenantId migration skipped:', e.message); }
        // Add tenantId to Exams
        try {
            await sequelize.query("ALTER TABLE Exams ADD COLUMN tenantId CHAR(36) NULL;");
            console.log('✅ Exams.tenantId column added');
        } catch (e) { console.log('ℹ️ Exams.tenantId migration skipped:', e.message); }
        // Add tenantId to Assignments
        try {
            await sequelize.query("ALTER TABLE Assignments ADD COLUMN tenantId CHAR(36) NULL;");
            console.log('✅ Assignments.tenantId column added');
        } catch (e) { console.log('ℹ️ Assignments.tenantId migration skipped:', e.message); }
        // Add tenantId to Announcements
        try {
            await sequelize.query("ALTER TABLE Announcements ADD COLUMN tenantId CHAR(36) NULL;");
            console.log('✅ Announcements.tenantId column added');
        } catch (e) { console.log('ℹ️ Announcements.tenantId migration skipped:', e.message); }
        // Add tenantId to QuestionBanks
        try {
            await sequelize.query("ALTER TABLE QuestionBanks ADD COLUMN tenantId CHAR(36) NULL;");
            console.log('✅ QuestionBanks.tenantId column added');
        } catch (e) { console.log('ℹ️ QuestionBanks.tenantId migration skipped:', e.message); }
        // Add tenantId to live_classes
        try {
            await sequelize.query("ALTER TABLE live_classes ADD COLUMN tenantId CHAR(36) NULL;");
            console.log('✅ live_classes.tenantId column added');
        } catch (e) { console.log('ℹ️ live_classes.tenantId migration skipped:', e.message); }
        // Add tenantId to ExamResults
        try {
            await sequelize.query("ALTER TABLE ExamResults ADD COLUMN tenantId CHAR(36) NULL;");
            console.log('✅ ExamResults.tenantId column added');
        } catch (e) { console.log('ℹ️ ExamResults.tenantId migration skipped:', e.message); }
        // Add tenantId to course_modules
        try {
            await sequelize.query("ALTER TABLE course_modules ADD COLUMN tenantId CHAR(36) NULL;");
            console.log('✅ course_modules.tenantId column added');
        } catch (e) { console.log('ℹ️ course_modules.tenantId migration skipped:', e.message); }
        // Add tenantId to lessons
        try {
            await sequelize.query("ALTER TABLE lessons ADD COLUMN tenantId CHAR(36) NULL;");
            console.log('✅ lessons.tenantId column added');
        } catch (e) { console.log('ℹ️ lessons.tenantId migration skipped:', e.message); }
        // Add createdByAdminName to Courses
        try {
            await sequelize.query("ALTER TABLE Courses ADD COLUMN createdByAdminName VARCHAR(255) NULL;");
            console.log('✅ Courses.createdByAdminName column added');
        } catch (e) { console.log('ℹ️ Courses.createdByAdminName migration skipped:', e.message); }
        // Auto-assign tenants to Admin accounts that have no tenantId
        try {
            const [nullAdmins] = await sequelize.query(
                "SELECT id, name FROM Users WHERE role = 'Admin' AND tenantId IS NULL"
            );
            for (const admin of nullAdmins) {
                await sequelize.query(
                    "INSERT INTO tenants (id, name, createdAt, updatedAt) VALUES (UUID(), ?, NOW(), NOW())",
                    { replacements: [`${admin.name} Academy`] }
                );
                const [[created]] = await sequelize.query(
                    "SELECT id FROM tenants ORDER BY createdAt DESC LIMIT 1"
                );
                await sequelize.query(
                    "UPDATE Users SET tenantId = ? WHERE id = ?",
                    { replacements: [created.id, admin.id] }
                );
                console.log(`✅ Auto-created tenant for Admin "${admin.name}" → tenantId: ${created.id}`);
            }
        } catch (e) { console.log('ℹ️ Admin tenant auto-assignment skipped:', e.message); }
        // Assign null-tenantId students/teachers to the earliest Admin's tenant (Admin 1)
        // This restores legacy data that existed before multi-tenant was introduced
        try {
            const [[firstAdmin]] = await sequelize.query(
                "SELECT id, name, tenantId FROM Users WHERE role = 'Admin' AND tenantId IS NOT NULL ORDER BY createdAt ASC LIMIT 1"
            );
            if (firstAdmin) {
                const [updated] = await sequelize.query(
                    "UPDATE Users SET tenantId = ? WHERE tenantId IS NULL AND role IN ('Student', 'Teacher')",
                    { replacements: [firstAdmin.tenantId] }
                );
                // Also fix orphaned courses, batches, exams, etc.
                await sequelize.query("UPDATE Courses SET tenantId = ? WHERE tenantId IS NULL", { replacements: [firstAdmin.tenantId] });
                await sequelize.query("UPDATE batches SET tenantId = ? WHERE tenantId IS NULL", { replacements: [firstAdmin.tenantId] });
                await sequelize.query("UPDATE Exams SET tenantId = ? WHERE tenantId IS NULL", { replacements: [firstAdmin.tenantId] });
                await sequelize.query("UPDATE Assignments SET tenantId = ? WHERE tenantId IS NULL", { replacements: [firstAdmin.tenantId] });
                await sequelize.query("UPDATE Announcements SET tenantId = ? WHERE tenantId IS NULL", { replacements: [firstAdmin.tenantId] });
                await sequelize.query("UPDATE QuestionBanks SET tenantId = ? WHERE tenantId IS NULL", { replacements: [firstAdmin.tenantId] });
                try { await sequelize.query("UPDATE live_classes SET tenantId = ? WHERE tenantId IS NULL", { replacements: [firstAdmin.tenantId] }); } catch(_) {}
                try { await sequelize.query("UPDATE ExamResults SET tenantId = ? WHERE tenantId IS NULL", { replacements: [firstAdmin.tenantId] }); } catch(_) {}
                // Fix modules and lessons (added in hybrid-tenant migration)
                try { await sequelize.query("UPDATE course_modules SET tenantId = ? WHERE tenantId IS NULL", { replacements: [firstAdmin.tenantId] }); } catch(_) {}
                try { await sequelize.query("UPDATE lessons SET tenantId = ? WHERE tenantId IS NULL", { replacements: [firstAdmin.tenantId] }); } catch(_) {}
                console.log(`✅ Assigned legacy null-tenantId data to Admin "${firstAdmin.name}" (tenantId: ${firstAdmin.tenantId})`);
            }
        } catch (e) { console.log('ℹ️ Legacy data tenant assignment skipped:', e.message); }

        httpServer.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use. Kill the existing process and restart.`);
                console.error(`   Run: netstat -ano | findstr :${PORT}  then  taskkill /PID <pid> /F`);
                process.exit(1);
            } else {
                throw err;
            }
        });
        httpServer.listen(PORT, () => {
            console.log(`🚀 BrightMind server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to connect to database:', error.message);
        process.exit(1);
    }
};

startServer();
