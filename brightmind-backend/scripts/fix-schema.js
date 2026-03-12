const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

async function fixSchema() {
    const queryInterface = sequelize.getQueryInterface();
    const tableName = 'lessons';

    try {
        const tableDescription = await queryInterface.describeTable(tableName);
        
        const expectedColumns = {
            videoUrl: { type: DataTypes.STRING, allowNull: true },
            fileUrl: { type: DataTypes.STRING, allowNull: true },
            type: { type: DataTypes.ENUM('video', 'pdf', 'text'), defaultValue: 'video' },
            description: { type: DataTypes.TEXT, allowNull: true },
            lessonOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
            duration: { type: DataTypes.STRING, allowNull: true }
        };

        for (const [colName, colDef] of Object.entries(expectedColumns)) {
            if (!tableDescription[colName]) {
                console.log(`Adding ${colName} column to ${tableName} table...`);
                try {
                    await queryInterface.addColumn(tableName, colName, colDef);
                    console.log(`Successfully added ${colName}.`);
                } catch (err) {
                    console.error(`Failed to add ${colName}:`, err.message);
                }
            } else {
                console.log(`${colName} column already exists.`);
            }
        }

        console.log('Schema fix completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing schema:', error);
        process.exit(1);
    }
}

fixSchema();
