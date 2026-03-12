const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

async function repairSchema() {
    const queryInterface = sequelize.getQueryInterface();

    const schemaInfo = {
        lessons: {
            videoUrl: { type: DataTypes.STRING, allowNull: true },
            fileUrl: { type: DataTypes.STRING, allowNull: true },
            type: { type: DataTypes.ENUM('video', 'pdf', 'text'), defaultValue: 'video' },
            description: { type: DataTypes.TEXT, allowNull: true },
            lessonOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
            duration: { type: DataTypes.STRING, allowNull: true }
        },
        Threads: {
            batchId: { type: DataTypes.UUID, allowNull: true },
            authorRole: { type: DataTypes.STRING, defaultValue: 'Student' },
            upvotes: { type: DataTypes.INTEGER, defaultValue: 0 },
            views: { type: DataTypes.INTEGER, defaultValue: 0 },
            status: { type: DataTypes.ENUM('Open', 'Closed', 'Resolved'), defaultValue: 'Open' },
            tags: { type: DataTypes.JSON, defaultValue: [] },
            repliesCount: { type: DataTypes.INTEGER, defaultValue: 0 }
        },
        Exams: {
            batchId: { type: DataTypes.UUID, allowNull: true },
            totalMarks: { type: DataTypes.INTEGER, defaultValue: 100 },
            duration: { type: DataTypes.INTEGER, defaultValue: 60 },
            status: { type: DataTypes.ENUM('Draft', 'Pending Approval', 'Approved', 'Active', 'Completed'), defaultValue: 'Draft' },
            sections: { type: DataTypes.JSON, defaultValue: [] },
            versions: { type: DataTypes.JSON, defaultValue: [] },
            lastSaved: { type: DataTypes.DATE, allowNull: true },
            reviewedBy: { type: DataTypes.STRING, allowNull: true },
            reviewNotes: { type: DataTypes.TEXT, allowNull: true },
            scheduledAt: { type: DataTypes.DATE, allowNull: true },
            expiresAt: { type: DataTypes.DATE, allowNull: true }
        },
        course_modules: {
            moduleOrder: { type: DataTypes.INTEGER, defaultValue: 0 }
        }
    };

    try {
        for (const [tableName, columns] of Object.entries(schemaInfo)) {
            console.log(`Checking table: ${tableName}`);
            let tableDescription;
            try {
                tableDescription = await queryInterface.describeTable(tableName);
            } catch (err) {
                console.error(`Table ${tableName} does not exist. Skipping...`);
                continue;
            }

            for (const [colName, colDef] of Object.entries(columns)) {
                if (!tableDescription[colName]) {
                    console.log(`Adding column ${colName} to ${tableName}...`);
                    try {
                        await queryInterface.addColumn(tableName, colName, colDef);
                        console.log(`Successfully added ${colName} to ${tableName}.`);
                    } catch (err) {
                        console.error(`Failed to add ${colName} to ${tableName}:`, err.message);
                    }
                } else {
                    console.log(`Column ${colName} already exists in ${tableName}.`);
                }
            }
        }
        console.log('--- Global Schema Repair Completed ---');
        process.exit(0);
    } catch (err) {
        console.error('Fatal Error during schema repair:', err);
        process.exit(1);
    }
}

repairSchema();
