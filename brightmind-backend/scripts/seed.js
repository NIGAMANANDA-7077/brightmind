const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Announcement = require('../models/Announcement');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Enrollment = require('../models/Enrollment');
const sequelize = require('../config/db');

const seedData = async () => {
    try {
        console.log("Connecting to database...");
        await sequelize.authenticate();
        await sequelize.sync({ force: true }); // Reset DB
        console.log("Database synced and reset!");

        // 0. Seed Users
        const users = await User.bulkCreate([
            {
                name: "Admin User",
                email: "admin@brightmind.com",
                password: "password123",
                role: "Admin",
                status: "Active"
            },
            {
                name: "Ananay Sharma",
                email: "ananay@brightmind.com",
                password: "password123",
                role: "Teacher",
                status: "Active",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananay"
            },
            {
                name: "Rahul Sharma",
                email: "rahul@student.com",
                password: "password123",
                role: "Student",
                status: "Active",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"
            },
            {
                name: "Priya Patel",
                email: "priya@student.com",
                password: "password123",
                role: "Student",
                status: "Active",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
            },
            {
                name: "Amit Kumar",
                email: "amit@student.com",
                password: "password123",
                role: "Student",
                status: "Active",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit"
            },
            {
                name: "Sneha Reddy",
                email: "sneha@student.com",
                password: "password123",
                role: "Student",
                status: "Active",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha"
            }
        ], { individualHooks: true });
        console.log(`✅ Seeded ${users.length} users`);

        // 1. Seed Courses
        const courses = await Course.bulkCreate([
            {
                title: "Advanced Full Stack Development",
                subject: "Web Development",
                description: "Master comprehensive development techniques from architecture to deployment.",
                status: "Active",
                thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80",
                teacherId: users[1].id, // Tie precisely to Ananay Sharma
                modules: [
                    {
                        id: 'm1',
                        title: 'Getting Started',
                        duration: '2 hours',
                        lessons: [
                            { id: 'l1', title: 'Introduction', type: 'video', duration: '15:00', isCompleted: true },
                            { id: 'l2', title: 'Environment Setup', type: 'reading', duration: '10:00', isCompleted: false }
                        ]
                    }
                ],
                studentsEnrolled: 1
            }
        ]);

        console.log(`✅ Seeded ${courses.length} courses`);

        // 2. Seed Assignments
        const assignments = await Assignment.bulkCreate([
            {
                title: "Build a Full Stack Application",
                courseId: courses[0].id,
                courseName: courses[0].title,
                deadline: "2026-03-20",
                totalMarks: 100,
                status: "Pending",
                type: "Written"
            }
        ]);

        console.log(`✅ Seeded ${assignments.length} assignments`);

        // 3. Seed Announcements
        const announcements = await Announcement.bulkCreate([
            {
                title: "Welcome to the new LMS Platform!",
                message: "We have fully integrated our backend and removed mock data. Enjoy a real database experience.",
                audience: "All",
                status: "Published",
                date: new Date(),
                postedBy: "System Admin"
            }
        ]);

        console.log(`✅ Seeded ${announcements.length} announcements`);

        // 4. Seed Questions
        const questions = await Question.bulkCreate([
            {
                text: 'What is the SI unit of Force?',
                topic: 'Physics',
                type: 'Multiple Choice',
                options: ['Newton', 'Joule', 'Pascal', 'Watt'],
                correctAnswer: 'Newton',
                difficulty: 'Easy'
            },
            {
                text: 'The value of Acceleration due to gravity (g) is approximately 9.8 m/s².',
                topic: 'Physics',
                type: 'True/False',
                correctAnswer: 'True',
                difficulty: 'Medium'
            }
        ]);
        console.log(`✅ Seeded ${questions.length} questions`);

        // 5. Seed Exams
        await Exam.create({
            title: 'Monthly Development Assessment',
            courseId: courses[0].id,
            courseName: courses[0].title,
            teacherName: 'Ananay Sharma',
            status: 'Pending Approval',
            totalMarks: 50,
            duration: 45,
            questions: [questions[0].id, questions[1].id]
        });
        console.log(`✅ Seeded 1 exam`);

        // 6. Seed Notifications
        const notifications = await Notification.bulkCreate([
            {
                title: 'Welcome!',
                message: 'Welcome to the new BrightMind LMS!',
                type: 'success',
                role: 'All',
                read: false
            },
            {
                title: 'Exam Pending',
                message: 'A new exam "Monthly Physics Assessment" is pending approval.',
                type: 'warning',
                role: 'Admin',
                read: false
            }
        ]);
        console.log(`✅ Seeded ${notifications.length} notifications`);

        const LiveClass = require('../models/LiveClass');
        const liveClass = await LiveClass.create({
            title: "Live Q&A: Architecture Patterns",
            course: courses[0].title,
            date: "2026-03-07", // Tomorrow
            time: "10:00 AM",
            duration: "60 mins",
            platform: "Zoom",
            link: "https://zoom.us/j/123456789",
            status: 'Upcoming',
            mentor: users[1].name
        });
        console.log(`✅ Seeded 1 live class`);

        // 7. Seed Enrollments for Priya (users[3])
        const enrollments = await Enrollment.bulkCreate([
            {
                studentId: users[3].id,
                courseId: courses[0].id,
                status: 'Active',
                progressPercentage: 50 // Partial completion demo
            }
        ]);
        console.log(`✅ Seeded ${enrollments.length} enrollments`);

        console.log("🎉 Seeding completed successfully!");
        process.exit();
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedData();
