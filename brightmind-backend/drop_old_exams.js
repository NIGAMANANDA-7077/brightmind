const sequelize = require('./config/db');

async function drop() {
    try {
        console.log('Dropping old exam tables...');
        // We have to drop ExamResults and Questions, and Exams.
        
        await sequelize.query('DROP TABLE IF EXISTS ExamResults;');
        await sequelize.query('DROP TABLE IF EXISTS Questions;');
        await sequelize.query('DROP TABLE IF EXISTS Exams;');
        
        console.log('Old exam tables dropped successfully! Sequelize will auto-sync the new tables.');
        process.exit(0);
    } catch (err) {
        console.error('Error dropping old exam tables:', err);
        process.exit(1);
    }
}

drop();
