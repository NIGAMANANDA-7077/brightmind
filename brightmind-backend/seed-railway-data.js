// Add courses, batches, and enrollments to Railway (skip users)
const { Sequelize } = require('sequelize');
const DB_URL = 'mysql://root:fAoteExVfyCzFPILGumipatgNVvOIROK@gondola.proxy.rlwy.net:17638/railway';
const sequelize = new Sequelize(DB_URL, { dialect: 'mysql', logging: false });

const seed = async () => {
    try {
        console.log('🔄 Connecting...');
        await sequelize.authenticate();
        console.log('✅ Connected!\n');

        // Get existing users
        const [users] = await sequelize.query('SELECT id, name, email, role FROM Users ORDER BY createdAt');
        console.log('👥 Found', users.length, 'users');
        
        const admin = users.find(u => u.role === 'Admin');
        const teacher = users.find(u => u.role === 'Teacher');
        const priya = users.find(u => u.email === 'priya@student.com');
        
        if (!admin || !teacher || !priya) {
            console.log('❌ Required users not found');
            process.exit(1);
        }

        // Get tenant
        const [tenants] = await sequelize.query('SELECT id FROM Tenants LIMIT 1');
        const tenantId = tenants.length > 0 ? tenants[0].id : null;

        // Delete old courses (to avoid duplicates)
        console.log('\n🗑️  Clearing old data...');
        await sequelize.query('DELETE FROM Enrollments');
        await sequelize.query('DELETE FROM Lessons');
        await sequelize.query('DELETE FROM Modules');
        await sequelize.query('DELETE FROM Courses');
        await sequelize.query('DELETE FROM BatchStudents');
        await sequelize.query('DELETE FROM Batches');
        console.log('✅ Old data cleared');

        // Insert courses
        console.log('\n📚 Creating courses...');
        await sequelize.query(`
            INSERT INTO Courses (id, title, subject, description, status, thumbnail, teacherId, tenantId, studentsEnrolled, youtubeUrl, price, duration, level, createdAt, updatedAt)
            VALUES 
            (UUID(), 'Full Stack Web Development', 'Web Development', 'Learn MERN stack from scratch', 'Active', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', '${teacher.id}', ${tenantId ? `'${tenantId}'` : 'NULL'}, 3, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 0, '40 hours', 'Beginner', NOW(), NOW()),
            (UUID(), 'React Advanced Patterns', 'Frontend', 'Master React with hooks and patterns', 'Active', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee', '${teacher.id}', ${tenantId ? `'${tenantId}'` : 'NULL'}, 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 0, '30 hours', 'Intermediate', NOW(), NOW()),
            (UUID(), 'Node.js Backend Development', 'Backend', 'Build scalable REST APIs', 'Active', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479', '${teacher.id}', ${tenantId ? `'${tenantId}'` : 'NULL'}, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 0, '35 hours', 'Advanced', NOW(), NOW())
        `);
        console.log('✅ 3 courses created');

        // Get created courses
        const [courses] = await sequelize.query('SELECT id, title FROM Courses');

        // Create modules for each course
        console.log('\n📖 Creating modules...');
        for (const course of courses) {
            await sequelize.query(`
                INSERT INTO Modules (id, title, description, courseId, orderIndex, createdAt, updatedAt)
                VALUES 
                (UUID(), 'Introduction', 'Getting started with ${course.title}', '${course.id}', 1, NOW(), NOW()),
                (UUID(), 'Core Concepts', 'Learn the fundamentals', '${course.id}', 2, NOW(), NOW())
            `);
        }
        console.log('✅ Modules created');

        // Get modules
        const [modules] = await sequelize.query('SELECT id, title, courseId FROM Modules');

        // Create lessons
        console.log('\n📝 Creating lessons...');
        for (const module of modules) {
            await sequelize.query(`
                INSERT INTO Lessons (id, title, content, videoUrl, duration, moduleId, orderIndex, isFree, createdAt, updatedAt)
                VALUES 
                (UUID(), '${module.title} - Part 1', 'Content for ${module.title}', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 15, '${module.id}', 1, TRUE, NOW(), NOW()),
                (UUID(), '${module.title} - Part 2', 'Advanced ${module.title}', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 20, '${module.id}', 2, FALSE, NOW(), NOW())
            `);
        }
        console.log('✅ Lessons created');

        // Create batches
        console.log('\n🎓 Creating batches...');
        await sequelize.query(`
            INSERT INTO Batches (id, name, description, startDate, endDate, tenantId, isActive, createdAt, updatedAt)
            VALUES 
            (UUID(), 'Batch 2024-A', 'Morning batch', '2024-01-01', '2024-06-30', ${tenantId ? `'${tenantId}'` : 'NULL'}, TRUE, NOW(), NOW()),
            (UUID(), 'Batch 2024-B', 'Evening batch', '2024-01-15', '2024-07-15', ${tenantId ? `'${tenantId}'` : 'NULL'}, TRUE, NOW(), NOW())
        `);
        console.log('✅ 2 batches created');

        // Get batches
        const [batches] = await sequelize.query('SELECT id, name FROM Batches');

        // Enroll Priya in courses
        console.log('\n📝 Enrolling Priya...');
        await sequelize.query(`
            INSERT INTO Enrollments (id, studentId, courseId, progressPercentage, status, enrolledAt, createdAt, updatedAt)
            VALUES 
            (UUID(), '${priya.id}', '${courses[0].id}', 25, 'Active', NOW(), NOW(), NOW()),
            (UUID(), '${priya.id}', '${courses[1].id}', 10, 'Active', NOW(), NOW(), NOW())
        `);
        console.log('✅ Priya enrolled in 2 courses');

        // Add Priya to batch
        await sequelize.query(`
            INSERT INTO BatchStudents (id, batchId, studentId, joinedAt, createdAt, updatedAt)
            VALUES (UUID(), '${batches[0].id}', '${priya.id}', NOW(), NOW(), NOW())
        `);
        console.log('✅ Priya added to', batches[0].name);

        console.log('\n🎉 Seeding complete!\n');
        console.log('📊 Summary:');
        console.log('  - Courses: 3');
        console.log('  - Modules: 6 (2 per course)');
        console.log('  - Lessons: 12 (2 per module)');
        console.log('  - Batches: 2');
        console.log('  - Enrollments: 2 (Priya)');
        console.log('\n✅ Login: priya@student.com / password123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seed();
