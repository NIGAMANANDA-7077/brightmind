const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'User'));
const Course = require(path.join(__dirname, '..', 'models', 'Course'));
const Enrollment = require(path.join(__dirname, '..', 'models', 'Enrollment'));
const sequelize = require(path.join(__dirname, '..', 'config', 'db'));

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');

        // 1. Find or Create Ananay Sharma (Teacher)
        let ananay = await User.findOne({ where: { name: 'Ananay Sharma' } });
        if (!ananay) {
            ananay = await User.create({
                id: 'ae8e7a63-122e-4b4d-9c3a-9e6e7a63122e', // Static UUID for consistency if needed
                name: 'Ananay Sharma',
                email: 'ananay.teacher@brightmind.com',
                password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
                role: 'Teacher',
                status: 'Active',
                department: 'Web Development',
                qualification: 'M.Tech in CS',
                experience: '5+ Years'
            });
            console.log('Created Teacher Ananay');
        } else {
            await ananay.update({ role: 'Teacher', status: 'Active' });
            console.log('Found Teacher Ananay');
        }

        // 2. Find or Create Priya Patel (Student)
        let priya = await User.findOne({ where: { name: 'Priya Patel' } });
        if (!priya) {
            priya = await User.create({
                id: 'be8e7a63-122e-4b4d-9c3a-9e6e7a63122e',
                name: 'Priya Patel',
                email: 'priya.student@brightmind.com',
                password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                role: 'Student',
                status: 'Active',
                batch: '2024-A'
            });
            console.log('Created Student Priya');
        } else {
            await priya.update({ role: 'Student', status: 'Active' });
            console.log('Found Student Priya');
        }

        // 3. Find or Create a Course for Ananay
        let course = await Course.findOne({ where: { teacherId: ananay.id } });
        if (!course) {
            course = await Course.create({
                title: 'Advanced Full Stack Development',
                description: 'A comprehensive guide to building modern web applications.',
                teacherId: ananay.id,
                duration: '12 Weeks',
                level: 'Advanced',
                category: 'Development',
                price: 499,
                status: 'Published'
            });
            console.log('Created Course for Ananay');
        } else {
            console.log('Found existing Course for Ananay');
        }

        // 4. Enroll Priya in the course
        let enrollment = await Enrollment.findOne({ where: { studentId: priya.id, courseId: course.id } });
        if (!enrollment) {
            await Enrollment.create({
                studentId: priya.id,
                courseId: course.id,
                status: 'Active'
            });
            console.log('Enrolled Priya in Ananays course');
        } else {
            console.log('Priya already enrolled in Ananays course');
        }

        console.log('--- LINKING COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Error during linking:', err);
        process.exit(1);
    }
})();
