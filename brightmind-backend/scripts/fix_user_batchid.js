const path = require('path');
const sequelize = require(path.join(__dirname, '..', 'config', 'db'));

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');

        // Check if the column exists first, or just run and catch error
        await sequelize.query('ALTER TABLE Users ADD COLUMN batchId CHAR(36) NULL;');
        console.log('Successfully added batchId column to Users table.');

    } catch (error) {
        if (error.message.includes('Duplicate column name')) {
            console.log('Column batchId already exists.');
        } else {
            console.error('Error adding batchId column:', error);
        }
    } finally {
        process.exit();
    }
})();
