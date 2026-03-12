const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExamResult = sequelize.define('ExamResult', {
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
    totalMarks: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    obtainedMarks: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    percentage: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    rank: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pass', 'fail', 'pending'),
        defaultValue: 'pending'
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = ExamResult;
