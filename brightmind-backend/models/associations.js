const User = require('./User');
const Course = require('./Course');
const Module = require('./Module');
const Lesson = require('./Lesson');
const Enrollment = require('./Enrollment');
const Thread = require('./Thread');
const Comment = require('./Comment');
const ThreadView = require('./ThreadView');
const ThreadUpvote = require('./ThreadUpvote');
const LiveClass = require('./LiveClass');
const Batch = require('./Batch');
const BatchStudent = require('./BatchStudent');
const Announcement = require('./Announcement');
const Assignment = require('./Assignment');
const Attendance = require('./Attendance');
const Notification = require('./Notification');
const Payment = require('./Payment');
const Review = require('./Review');
const Exam = require('./Exam');
const ExamResult = require('./ExamResult');
const QuestionBank = require('./QuestionBank');
const QuestionOption = require('./QuestionOption');
const ExamQuestion = require('./ExamQuestion');
const ExamAttempt = require('./ExamAttempt');
const StudentAnswer = require('./StudentAnswer');
// ─── Course Structure ───────────────────────────────────────
Course.hasMany(Module, { foreignKey: 'courseId', as: 'courseModules' });
Module.belongsTo(Course, { foreignKey: 'courseId' });

Module.hasMany(Lesson, { foreignKey: 'moduleId', as: 'lessons' });
Lesson.belongsTo(Module, { foreignKey: 'moduleId' });

// ─── Live Class Relationships ────────────────────────────
Course.hasMany(LiveClass, { foreignKey: 'courseId', as: 'liveClasses' });
LiveClass.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

User.hasMany(LiveClass, { foreignKey: 'teacherId', as: 'scheduledClasses' });
LiveClass.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// ─── Teacher & Student Relationships ──────────────────────
User.hasMany(Course, { foreignKey: 'teacherId', as: 'taughtCourses' });
Course.belongsTo(User, { foreignKey: 'teacherId', as: 'instructor' });

User.hasMany(Enrollment, { foreignKey: 'studentId', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// ─── Batch Relationships ─────────────────────────────────
Course.hasMany(Batch, { foreignKey: 'courseId', as: 'batches' });
Batch.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

User.hasMany(Batch, { foreignKey: 'teacherId', as: 'teachingBatches' });
Batch.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

Batch.belongsToMany(User, { through: BatchStudent, foreignKey: 'batchId', otherKey: 'studentId', as: 'students' });
User.belongsToMany(Batch, { through: BatchStudent, foreignKey: 'studentId', otherKey: 'batchId', as: 'enrolledBatches' });

Batch.hasMany(LiveClass, { foreignKey: 'batchId', as: 'batchLiveClasses', constraints: false });
LiveClass.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch', constraints: false });

// ─── Batch → Announcement ───────────────────────────────
Batch.hasMany(Announcement, { foreignKey: 'batchId', as: 'announcements', constraints: false });
Announcement.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch', constraints: false });

// ─── Batch → Assignment ─────────────────────────────────
Batch.hasMany(Assignment, { foreignKey: 'batchId', as: 'assignments', constraints: false });
Assignment.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch', constraints: false });

// ─── Batch → Enrollment ─────────────────────────────────
Batch.hasMany(Enrollment, { foreignKey: 'batchId', as: 'batchEnrollments', constraints: false });
Enrollment.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch', constraints: false });

// ─── Batch → Attendance ─────────────────────────────────
Batch.hasMany(Attendance, { foreignKey: 'batchId', as: 'attendances', constraints: false });
Attendance.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch', constraints: false });
LiveClass.hasMany(Attendance, { foreignKey: 'liveClassId', as: 'attendances', constraints: false });
Attendance.belongsTo(LiveClass, { foreignKey: 'liveClassId', as: 'liveClass', constraints: false });
User.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendanceRecords', constraints: false });
Attendance.belongsTo(User, { foreignKey: 'studentId', as: 'student', constraints: false });

// ─── Batch → Notification ───────────────────────────────
Batch.hasMany(Notification, { foreignKey: 'batchId', as: 'notifications', constraints: false });
Notification.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch', constraints: false });

// ─── Payment Relationships ──────────────────────────────
User.hasMany(Payment, { foreignKey: 'studentId', as: 'payments', constraints: false });
Payment.belongsTo(User, { foreignKey: 'studentId', as: 'student', constraints: false });
Course.hasMany(Payment, { foreignKey: 'courseId', as: 'payments', constraints: false });
Payment.belongsTo(Course, { foreignKey: 'courseId', as: 'course', constraints: false });

// ─── Review Relationships ───────────────────────────────
User.hasMany(Review, { foreignKey: 'studentId', as: 'reviews', constraints: false });
Review.belongsTo(User, { foreignKey: 'studentId', as: 'student', constraints: false });
Course.hasMany(Review, { foreignKey: 'courseId', as: 'reviews', constraints: false });
Review.belongsTo(Course, { foreignKey: 'courseId', as: 'course', constraints: false });

// ─── Forum Relationships ────────────────────────────────────
User.hasMany(Thread, { foreignKey: 'authorId', as: 'threads' });
Thread.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Course.hasMany(Thread, { foreignKey: 'courseId', as: 'threads' });
Thread.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Thread.hasMany(Comment, { foreignKey: 'threadId', as: 'comments' });
Comment.belongsTo(Thread, { foreignKey: 'threadId', as: 'thread' });

User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Thread.hasMany(ThreadView, { foreignKey: 'threadId', as: 'threadViews' });
ThreadView.belongsTo(Thread, { foreignKey: 'threadId' });

Thread.hasMany(ThreadUpvote, { foreignKey: 'threadId', as: 'threadUpvotes' });
ThreadUpvote.belongsTo(Thread, { foreignKey: 'threadId' });

// ─── Batch → Thread ─────────────────────────────────────
Batch.hasMany(Thread, { foreignKey: 'batchId', as: 'threads', constraints: false });
Thread.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch', constraints: false });

User.hasMany(ThreadView, { foreignKey: 'userId', as: 'views' });
ThreadView.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ThreadUpvote, { foreignKey: 'userId', as: 'upvotes' });
ThreadUpvote.belongsTo(User, { foreignKey: 'userId' });

// ─── Advanced Exam System Relationships ──────────────────
Batch.hasMany(Exam, { foreignKey: 'batchId', as: 'exams', constraints: false });
Exam.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch', constraints: false });

Course.hasMany(Exam, { foreignKey: 'courseId', as: 'exams', constraints: false });
Exam.belongsTo(Course, { foreignKey: 'courseId', as: 'course', constraints: false });

Course.hasMany(QuestionBank, { foreignKey: 'courseId', as: 'questions', constraints: false });
QuestionBank.belongsTo(Course, { foreignKey: 'courseId', as: 'course', constraints: false });

QuestionBank.hasMany(QuestionOption, { foreignKey: 'questionId', as: 'options', onDelete: 'CASCADE' });
QuestionOption.belongsTo(QuestionBank, { foreignKey: 'questionId', as: 'question' });

Exam.hasMany(ExamQuestion, { foreignKey: 'examId', as: 'examQuestions', onDelete: 'CASCADE' });
ExamQuestion.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

QuestionBank.hasMany(ExamQuestion, { foreignKey: 'questionId', as: 'examLinks', onDelete: 'CASCADE' });
ExamQuestion.belongsTo(QuestionBank, { foreignKey: 'questionId', as: 'question' });

Exam.hasMany(ExamAttempt, { foreignKey: 'examId', as: 'attempts', onDelete: 'CASCADE' });
ExamAttempt.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

User.hasMany(ExamAttempt, { foreignKey: 'studentId', as: 'examAttempts' });
ExamAttempt.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

ExamAttempt.hasMany(StudentAnswer, { foreignKey: 'attemptId', as: 'answers', onDelete: 'CASCADE' });
StudentAnswer.belongsTo(ExamAttempt, { foreignKey: 'attemptId', as: 'attempt' });

QuestionBank.hasMany(StudentAnswer, { foreignKey: 'questionId', as: 'studentAnswers' });
StudentAnswer.belongsTo(QuestionBank, { foreignKey: 'questionId', as: 'question' });

Exam.hasMany(ExamResult, { foreignKey: 'examId', as: 'results', onDelete: 'CASCADE' });
ExamResult.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

User.hasMany(ExamResult, { foreignKey: 'studentId', as: 'examResults' });
ExamResult.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Batch.hasMany(ExamResult, { foreignKey: 'batchId', as: 'batchExamResults', constraints: false });
ExamResult.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch', constraints: false });

module.exports = {
    User,
    Course,
    Module,
    Lesson,
    Enrollment,
    Thread,
    Comment,
    ThreadView,
    ThreadUpvote,
    Batch,
    BatchStudent,
    Announcement,
    Assignment,
    Attendance,
    Notification,
    Payment,
    Review,
    LiveClass,
    Exam,
    ExamResult,
    QuestionBank,
    QuestionOption,
    ExamQuestion,
    ExamAttempt,
    StudentAnswer
};
