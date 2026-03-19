// Check Railway database users
require('dotenv').config();
const { Sequelize } = require('sequelize');

const RAILWAY_DB_URL = process.env.RAILWAY_DATABASE_URL || 'mysql://root:fAoteExVfyCzFPILGumipatgNVvOIROK@gondola.proxy.rlwy.net:17638/railway';

const sequelize = new Sequelize(RAILWAY_DB_URL, {
    dialect: 'mysql',
    logging: false
});

const checkUsers = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to Railway DB\n');

        const [users] = await sequelize.query('SELECT id, name, email, role, status, createdAt FROM Users ORDER BY createdAt DESC');
        
        console.log('📋 Current Users in Railway Database:');
        console.log('═══════════════════════════════════════════════════════════');
        
        if (users.length === 0) {
            console.log('❌ No users found!');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email})`);
                console.log(`   Role: ${user.role} | Status: ${user.status}`);
                console.log(`   Created: ${user.createdAt}`);
                console.log('───────────────────────────────────────────────────────────');
            });
        }
        
        console.log(`\nTotal Users: ${users.length}\n`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkUsers();
