// Temporary script to seed Railway database
// Run with: node seed-railway.js

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Railway MySQL connection (replace with your Railway credentials)
const RAILWAY_DB_URL = process.env.RAILWAY_DATABASE_URL || 'mysql://user:password@host:port/database';

console.log('🔗 Connecting to Railway MySQL...');
console.log('Database URL:', RAILWAY_DB_URL.replace(/:[^:]*@/, ':****@')); // Hide password

const sequelize = new Sequelize(RAILWAY_DB_URL, {
    dialect: 'mysql',
    logging: console.log,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Import models (make sure paths are correct)
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const LiveClass = require('./models/LiveClass');
const Assignment = require('./models/Assignment');
const Thread = require('./models/Thread');
const Tenant = require('./models/Tenant');
const bcrypt = require('bcryptjs');

const seedRailway = async () => {
    try {
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Connected to Railway MySQL!');

        // Sync database (creates all tables)
        console.log('🔄 Syncing database schema...');
        await sequelize.sync({ force: true }); // WARNING: This drops all tables
        console.log('✅ Database synced!');

        // Create default tenant
        console.log('🏢 Creating default tenant...');
        const [defaultTenant] = await Tenant.findOrCreate({
            where: { id: '00000000-0000-0000-0000-000000000001' },
            defaults: {
                name: 'BrightMind Academy',
                subdomain: 'brightmind',
                customDomain: null,
                isActive: true,
                settings: JSON.stringify({
                    theme: 'light',
                    allowRegistration: true
                })
            }
        });
        console.log('✅ Default tenant created:', defaultTenant.name);

        // Create SuperAdmin
        console.log('👤 Creating SuperAdmin...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const [superAdmin] = await User.findOrCreate({
            where: { email: 'superadmin@brightmind.com' },
            defaults: {
                name: 'Super Admin',
                password: hashedPassword,
                role: 'SuperAdmin',
                status: 'Active',
                tenantId: defaultTenant.id
            }
        });
        console.log('✅ SuperAdmin created:', superAdmin.email);

        // Create Regular Admin
        console.log('👤 Creating Admin...');
        const [admin] = await User.findOrCreate({
            where: { email: 'admin@brightmind.com' },
            defaults: {
                name: 'Admin User',
                password: hashedPassword,
                role: 'Admin',
                status: 'Active',
                tenantId: defaultTenant.id
            }
        });
        console.log('✅ Admin created:', admin.email);

        // Create Teacher
        console.log('👨‍🏫 Creating Teacher...');
        const [teacher] = await User.findOrCreate({
            where: { email: 'teacher@brightmind.com' },
            defaults: {
                name: 'Professor Bright',
                password: hashedPassword,
                role: 'Teacher',
                status: 'Active',
                tenantId: defaultTenant.id
            }
        });
        console.log('✅ Teacher created:', teacher.email);

        // Create Student
        console.log('🎓 Creating Student...');
        const [student] = await User.findOrCreate({
            where: { email: 'student@brightmind.com' },
            defaults: {
                name: 'John Doe',
                password: hashedPassword,
                role: 'Student',
                status: 'Active',
                tenantId: defaultTenant.id
            }
        });
        console.log('✅ Student created:', student.email);

        console.log('\n🎉 Railway Database Seeded Successfully!\n');
        console.log('📝 Login Credentials:');
        console.log('──────────────────────────────────────');
        console.log('SuperAdmin: superadmin@brightmind.com / admin123');
        console.log('Admin:      admin@brightmind.com / admin123');
        console.log('Teacher:    teacher@brightmind.com / admin123');
        console.log('Student:    student@brightmind.com / admin123');
        console.log('──────────────────────────────────────\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedRailway();
