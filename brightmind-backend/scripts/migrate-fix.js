const sequelize = require('../config/db');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        const queryInterface = sequelize.getQueryInterface();

        // Add 'topic' to QuestionBanks
        try {
            await queryInterface.addColumn('QuestionBanks', 'topic', {
                type: require('sequelize').DataTypes.STRING,
                allowNull: true
            });
            console.log('Column "topic" added to QuestionBanks.');
        } catch (e) {
            console.log('Topic column might already exist or table missing:', e.message);
        }

        // Add 'sectionName' to ExamQuestions
        try {
            await queryInterface.addColumn('ExamQuestions', 'sectionName', {
                type: require('sequelize').DataTypes.STRING,
                allowNull: true
            });
            console.log('Column "sectionName" added to ExamQuestions.');
        } catch (e) {
            console.log('sectionName column might already exist or table missing:', e.message);
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
