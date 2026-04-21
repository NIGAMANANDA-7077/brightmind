const seq = require('../config/db');

async function migrate() {
    try {
        await seq.query('ALTER TABLE Users ADD COLUMN resetToken VARCHAR(255) NULL');
        console.log('✅ resetToken column added');
    } catch (e) {
        if (e.message.includes('Duplicate column')) {
            console.log('ℹ️ resetToken already exists');
        } else {
            console.error('❌ resetToken error:', e.message);
        }
    }

    try {
        await seq.query('ALTER TABLE Users ADD COLUMN resetTokenExpiry DATETIME NULL');
        console.log('✅ resetTokenExpiry column added');
    } catch (e) {
        if (e.message.includes('Duplicate column')) {
            console.log('ℹ️ resetTokenExpiry already exists');
        } else {
            console.error('❌ resetTokenExpiry error:', e.message);
        }
    }

    console.log('✅ Migration complete');
    process.exit(0);
}

migrate();
