// Complete Railway Database Seeding
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const DB_URL = 'mysql://root:fAoteExVfyCzFPILGumipatgNVvOIROK@gondola.proxy.rlwy.net:17638/railway';
const sequelize = new Sequelize(DB_URL, { dialect: 'mysql', logging: false });

// Define models inline
const Tenant = sequelize.define('Tenant', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    subdomain: { type: DataTypes.STRING, unique: true },
    customDomain: DataTypes.STRING,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    settings: DataTypes.TEXT
}, { timestamps: true });

const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Admin', 'Teacher', 'Student', 'SuperAdmin'), defaultValue: 'Student' },
    avatar: DataTypes.STRING,
    phone: DataTypes.STRING,
    bio: DataTypes.TEXT,
    qualification: DataTypes.STRING,
    experience: DataTypes.STRING,
    department: DataTypes.STRING,
    subject: DataTypes.STRING,
    batch: DataTypes.STRING,
    batchId: DataTypes.UUID,
    tenantId: DataTypes.UUID,
    status: { type: DataTypes.ENUM('Active', 'Inactive', 'Suspended'), defaultValue: 'Active' },
    lastLoginAt: DataTypes.DATE,
    mustChangePassword: { type: DataTypes.BOOLEAN, defaultValue: false },
    totalHoursLearned: { type: DataTypes.INTEGER, defaultValue: 0 },
    monthlyProgress: { type: DataTypes.JSON, defaultValue: [
        { name: 'Week 1', hours: 0 }, { name: 'Week 2', hours: 0 },
        { name: 'Week 3', hours: 0 }, { name: 'Week 4', hours: 0 }
    ]}
}, { 
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

const Course = sequelize.define('Course', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    category: DataTypes.STRING,
    level: { type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'), defaultValue: 'Beginner' },
    duration: DataTypes.INTEGER,
    price: { type: DataTypes.FLOAT, defaultValue: 0 },
    thumbnail: DataTypes.STRING,
    instructor: DataTypes.STRING,
    instructorId: DataTypes.UUID,
    tenantId: DataTypes.UUID,
    isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
    enrollmentCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 }
}, { timestamps: true });

const Batch = sequelize.define('Batch', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    tenantId: DataTypes.UUID,
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

const Module = sequelize.define('Module', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    courseId: DataTypes.UUID,
    orderIndex: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { timestamps: true });

const Lesson = sequelize.define('Lesson', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    content: DataTypes.TEXT,
    videoUrl: DataTypes.STRING,
    duration: DataTypes.INTEGER,
    moduleId: DataTypes.UUID,
    orderIndex: { type: DataTypes.INTEGER, defaultValue: 0 },
    isFree: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

const Enrollment = sequelize.define('Enrollment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    courseId: { type: DataTypes.UUID, allowNull: false },
    enrolledAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    progress: { type: DataTypes.FLOAT, defaultValue: 0 },
    completedAt: DataTypes.DATE,
    status: { type: DataTypes.ENUM('Active', 'Completed', 'Dropped'), defaultValue: 'Active' }
}, { timestamps: true });

const BatchStudent = sequelize.define('BatchStudent', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    batchId: { type: DataTypes.UUID, allowNull: false },
    studentId: { type: DataTypes.UUID, allowNull: false },
    joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { timestamps: true });

const seedRailway = async () => {
    try {
        console.log('🔄 Connecting to Railway...');
        await sequelize.authenticate();
        console.log('✅ Connected!\n');

        // Sync schema (don't use force: true as it drops data)
        console.log('🔄 Syncing schema...');
        await sequelize.sync({ alter: false });
        console.log('✅ Schema synced!\n');

        // Check if data already exists
        const userCount = await User.count();
        if (userCount > 6) {
            console.log('⚠️  Data already exists. Checking courses...');
            const courseCount = await Course.count();
            if (courseCount >= 3) {
                console.log('✅ Sufficient data exists. Exiting.');
                process.exit(0);
            }
        }

        // Get tenant
        let tenant = await Tenant.findOne({ where: { subdomain: 'brightmind' } });
        if (!tenant) {
            tenant = await Tenant.create({
                name: 'BrightMind Academy',
                subdomain: 'brightmind',
                isActive: true,
                settings: JSON.stringify({ theme: 'light', allowRegistration: true })
            });
            console.log('✅ Tenant created');
        }

        // Get existing users
        const admin = await User.findOne({ where: { email: 'admin@brightmind.com' } });
        const teacher = await User.findOne({ where: { email: 'ananay@brightmind.com' } });
        const priya = await User.findOne({ where: { email: 'priya@student.com' } });

        console.log('👥 Found users:', { admin: !!admin, teacher: !!teacher, priya: !!priya });

        // Create courses
        console.log('\n📚 Creating courses...');
        const courses = await Course.bulkCreate([
            {
                title: 'Web Development Fundamentals',
                description: 'Learn HTML, CSS, JavaScript basics',
                category: 'Web Development',
                level: 'Beginner',
                duration: 40,
                price: 0,
                thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
                instructor: teacher?.name || 'Teacher',
                instructorId: teacher?.id,
                tenantId: tenant.id,
                isPublished: true,
                enrollmentCount: 3,
                rating: 4.5
            },
            {
                title: 'React.js Mastery',
                description: 'Master React from scratch to advanced',
                category: 'Frontend',
                level: 'Intermediate',
                duration: 60,
                price: 0,
                thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
                instructor: teacher?.name || 'Teacher',
                instructorId: teacher?.id,
                tenantId: tenant.id,
                isPublished: true,
                enrollmentCount: 2,
                rating: 4.8
            },
            {
                title: 'Node.js & Express Backend',
                description: 'Build scalable backend applications',
                category: 'Backend',
                level: 'Advanced',
                duration: 50,
                price: 0,
                thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479',
                instructor: teacher?.name || 'Teacher',
                instructorId: teacher?.id,
                tenantId: tenant.id,
                isPublished: true,
                enrollmentCount: 1,
                rating: 4.7
            }
        ]);
        console.log('✅ Created', courses.length, 'courses');

        // Create batches
        console.log('\n🎓 Creating batches...');
        const batches = await Batch.bulkCreate([
            {
                name: 'Batch 2024-A',
                description: 'Morning batch for web development',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-06-30'),
                tenantId: tenant.id,
                isActive: true
            },
            {
                name: 'Batch 2024-B',
                description: 'Evening batch for full stack',
                startDate: new Date('2024-01-15'),
                endDate: new Date('2024-07-15'),
                tenantId: tenant.id,
                isActive: true
            }
        ]);
        console.log('✅ Created', batches.length, 'batches');

        // Create modules & lessons for each course
        console.log('\n📖 Creating modules & lessons...');
        for (const course of courses) {
            const modules = await Module.bulkCreate([
                {
                    title: 'Introduction',
                    description: 'Getting started',
                    courseId: course.id,
                    orderIndex: 1
                },
                {
                    title: 'Core Concepts',
                    description: 'Learn the fundamentals',
                    courseId: course.id,
                    orderIndex: 2
                }
            ]);

            for (const module of modules) {
                await Lesson.bulkCreate([
                    {
                        title: `${module.title} - Part 1`,
                        content: `Content for ${module.title}`,
                        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        duration: 15,
                        moduleId: module.id,
                        orderIndex: 1,
                        isFree: true
                    },
                    {
                        title: `${module.title} - Part 2`,
                        content: `Advanced ${module.title}`,
                        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        duration: 20,
                        moduleId: module.id,
                        orderIndex: 2,
                        isFree: false
                    }
                ]);
            }
        }
        console.log('✅ Modules & lessons created');

        // Enroll Priya in courses
        if (priya) {
            console.log('\n📝 Enrolling Priya...');
            await Enrollment.bulkCreate([
                {
                    userId: priya.id,
                    courseId: courses[0].id,
                    progress: 25,
                    status: 'Active'
                },
                {
                    userId: priya.id,
                    courseId: courses[1].id,
                    progress: 10,
                    status: 'Active'
                }
            ]);
            console.log('✅ Priya enrolled in 2 courses');

            // Add Priya to batch
            await BatchStudent.create({
                batchId: batches[0].id,
                studentId: priya.id
            });
            console.log('✅ Priya added to Batch 2024-A');
        }

        console.log('\n🎉 Railway seeding completed!\n');
        console.log('📊 Summary:');
        console.log('  - Courses:', courses.length);
        console.log('  - Batches:', batches.length);
        console.log('  - Modules: 6 (2 per course)');
        console.log('  - Lessons: 12 (2 per module)');
        console.log('  - Enrollments:', priya ? 2 : 0);
        console.log('\n✅ Login and test: priya@student.com / password123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seedRailway();
