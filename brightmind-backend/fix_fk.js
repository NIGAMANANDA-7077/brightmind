const sequelize = require('./config/db');

async function fix() {
    let log = [];
    try {
        console.log('Adding batchId to live_classes table...');
        await sequelize.query("ALTER TABLE `live_classes` ADD COLUMN `batchId` CHAR(36) NULL");
        console.log('✅ Success: batchId added to live_classes');
    } catch(e) {
        if (e.original?.code === 'ER_DUP_FIELDNAME') {
            console.log('⏭️  live_classes.batchId already exists');
        } else {
            console.log('Error:', e.original?.sqlMessage || e.message);
        }
    }
    process.exit(0);
}

fix();
