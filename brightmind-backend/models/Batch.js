const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Batch = sequelize.define('Batch', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    batchName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    teacherId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    batchStatus: {
        type: DataTypes.ENUM('active', 'completed', 'upcoming'),
        defaultValue: 'upcoming'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tenantId: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    tableName: 'batches',
    timestamps: true
});

module.exports = Batch;
