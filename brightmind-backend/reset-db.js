const sequelize = require('./config/db');

(async () => {
    try {
        console.log('🔄 Checking tables...');
        const [tables] = await sequelize.query('SHOW TABLES');
        console.log(`Found ${tables.length} tables`);
        
        if (tables.length > 0) {
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
            
            for (let t of tables) {
                const tableName = Object.values(t)[0];
                await sequelize.query(`DROP TABLE ${tableName}`);
                console.log(`✅ Dropped: ${tableName}`);
            }
            
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
            console.log('\n✅ All tables dropped successfully!');
        } else {
            console.log('✅ Database is already empty!');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
