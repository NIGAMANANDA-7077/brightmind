const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExamResult = sequelize.define('ExamResult', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    studentId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    examId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    totalMarks: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    answers: {
        type: DataTypes.JSON, // Stores the student's submitted answers
        defaultValue: {}
    },
    submittedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['studentId', 'examId'] // Assuming student can only submit once, remove if multiple attempts allowed
        }
    ]
});

module.exports = ExamResult;
