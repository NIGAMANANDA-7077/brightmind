const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExamAttempt = sequelize.define('ExamAttempt', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    examId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    studentId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    batchId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    submitTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'submitted', 'evaluated'),
        defaultValue: 'in_progress'
    },
    totalScore: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    isFlagged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    flagReason: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = ExamAttempt;
