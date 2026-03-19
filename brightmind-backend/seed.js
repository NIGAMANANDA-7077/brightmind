const sequelize = require('./config/db');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const LiveClass = require('./models/LiveClass');
const Assignment = require('./models/Assignment');
const Thread = require('./models/Thread');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        await sequelize.authenticate();
        console.log('--- Comprehensive Seeding Started ---');
        
        // Use alter: true instead of force: true for production
        // This will NOT drop tables, only sync schema changes
        await sequelize.sync({ alter: true });
        console.log('Database synced (schema updated)');

        // 0. Create Admins
        const [superAdmin] = await User.findOrCreate({
            where: { email: 'superadmin@brightmind.com' },
            defaults: { name: 'Main Super Admin', password: 'password123', role: 'SuperAdmin', status: 'Active' }
        });
        console.log('Super Admin created');

        const [admin] = await User.findOrCreate({
            where: { email: 'admin@brightmind.com' },
            defaults: { name: 'Regular Admin', password: 'password123', role: 'Admin', status: 'Active' }
        });
        console.log('Regular Admin created');

        // 1. Create Teachers
        const [profBright] = await User.findOrCreate({
            where: { email: 'teacher@example.com' },
            defaults: {
                name: 'Professor Bright',
                password: 'password123',
                role: 'Teacher',
                status: 'Active',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
            }
        });

        const [ananay] = await User.findOrCreate({
            where: { email: 'ananay@brightmind.com' },
            defaults: {
                name: 'Ananay Sharma',
                password: 'password123',
                role: 'Teacher',
                status: 'Active',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
            }
        });

        const [ananayAlt] = await User.findOrCreate({
            where: { email: 'ananay.teacher@brightmind.com' },
            defaults: { name: 'Ananay Sharma', password: 'password123', role: 'Teacher', status: 'Active' }
        });

        const [ananayLegacy] = await User.findOrCreate({
            where: { email: 'ananay@teacher.com' },
            defaults: { name: 'Ananay Sharma', password: 'password123', role: 'Teacher', status: 'Active' }
        });
        console.log('Teachers created');

        // 2. Create Students
        const [brightStudent] = await User.findOrCreate({
            where: { email: 'student@example.com' },
            defaults: { name: 'Bright Student', password: 'password123', role: 'Student', status: 'Active' }
        });

        const [priya] = await User.findOrCreate({
            where: { email: 'priya@student.com' },
            defaults: { name: 'Priya Patel', password: 'password123', role: 'Student', status: 'Active' }
        });
        console.log('Students created');

        // 3. Create Courses
        const course1 = await Course.create({
            title: 'Advanced Web Development',
            subject: 'Technology',
            description: 'A comprehensive guide to modern web technologies.',
            teacherId: ananay.id,
            thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
            status: 'Active',
            duration: '20 Hours',
            level: 'Intermediate',
            detailedDescription: 'This course covers everything from React to Node.js.',
            learningOutcomes: '✔ Build scalable web applications\n✔ Understand Full Stack Architecture\n✔ Implement Secure Authentication',
            syllabusUrl: '',
            modules: [
                {
                    id: 'm1',
                    title: 'React Fundamentals',
                    lessons: [
                        { id: 'l1', title: 'Introduction to React', duration: '10:00', type: 'video', isCompleted: false },
                        { id: 'l2', title: 'State & Props', duration: '15:00', type: 'video', isCompleted: false },
                        { id: 'l3', title: 'React Hooks Deep Dive', duration: '20:00', type: 'video', isCompleted: true }
                    ]
                },
                {
                    id: 'm2',
                    title: 'Node.js & Backend',
                    lessons: [
                        { id: 'l4', title: 'Introduction to Node.js', duration: '12:00', type: 'video', isCompleted: false },
                        { id: 'l5', title: 'Express.js Framework', duration: '18:00', type: 'video', isCompleted: false }
                    ]
                }
            ],
            studentsEnrolled: 1
        });

        const course2 = await Course.create({
            title: 'UI/UX Design Masterclass',
            subject: 'Design',
            description: 'Learn to create stunning user interfaces.',
            teacherId: profBright.id,
            thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
            status: 'Active',
            duration: '15 Hours',
            level: 'Beginner',
            detailedDescription: 'Master Figma and design principles.',
            learningOutcomes: '✔ Master Figma\n✔ Learn Color Theory\n✔ Build High-Fidelity Prototypes',
            syllabusUrl: '',
            modules: [
                {
                    id: 'dm1',
                    title: 'Design Principles',
                    lessons: [
                        { id: 'dl1', title: 'Typography & Colors', duration: '08:00', type: 'video', isCompleted: false },
                        { id: 'dl2', title: 'Layout Systems', duration: '10:00', type: 'video', isCompleted: false }
                    ]
                },
                {
                    id: 'dm2',
                    title: 'Figma Mastery',
                    lessons: [
                        { id: 'dl3', title: 'Components & Variants', duration: '25:00', type: 'video', isCompleted: false }
                    ]
                }
            ],
            studentsEnrolled: 1
        });
        console.log('Courses created');

        // 4. Create Enrollments
        await Enrollment.create({ studentId: priya.id, courseId: course1.id, status: 'Active' });
        await Enrollment.create({ studentId: priya.id, courseId: course2.id, status: 'Active' });
        console.log('Enrollments created for Priya');

        // 5. Create Live Classes
        await LiveClass.create({
            title: 'React Props & State Deep Dive',
            course: 'Advanced Web Development',
            date: new Date().toISOString().split('T')[0],
            time: '02:00 PM',
            duration: '1 Hour',
            platform: 'Zoom',
            link: 'https://zoom.us/test',
            status: 'Upcoming',
            mentor: 'Ananay Teacher'
        });

        await LiveClass.create({
            title: 'Introduction to Figma Tools',
            course: 'UI/UX Design Masterclass',
            date: new Date().toISOString().split('T')[0],
            time: '04:00 PM',
            duration: '1.5 Hours',
            platform: 'Google Meet',
            link: 'https://meet.google.com/test',
            status: 'Upcoming',
            mentor: 'Professor Bright'
        });
        console.log('Live Classes created');

        // 6. Create Assignments
        await Assignment.create({
            title: 'Build a Personal Portfolio',
            courseId: course1.id,
            courseName: course1.title,
            deadline: '2026-03-20',
            totalMarks: 100,
            status: 'Pending',
            type: 'File'
        });

        await Assignment.create({
            title: 'Design Style Guide',
            courseId: course2.id,
            courseName: course2.title,
            deadline: '2026-03-15',
            totalMarks: 50,
            status: 'Pending',
            type: 'File'
        });
        console.log('Assignments created');

        // 7. Create Forum Threads
        await Thread.create({
            title: 'How to manage React State?',
            description: 'I am confused between Redux and Context API. Any advice?',
            courseId: course1.id,
            authorId: priya.id,
            authorName: priya.name,
            authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
            tags: ['React', 'State Management'],
            status: 'Open'
        });
        console.log('Forum Threads created');

        console.log('--- Seeding Finished Successfully ---');
        console.log('Login with: priya@student.com / password123');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
