const sequelize = require('./config/db');

(async () => {
    try {
        console.log('🔄 Dropping database...');
        await sequelize.query('DROP DATABASE IF EXISTS lms_database');
        console.log('✅ Database dropped');
        
        console.log('🔄 Creating fresh database...');
        await sequelize.query('CREATE DATABASE lms_database');
        console.log('✅ Database created');
        
        console.log('\n✅ Now run: node scripts/seed.js');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
