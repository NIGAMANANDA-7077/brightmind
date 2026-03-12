const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const StudentAnswer = sequelize.define('StudentAnswer', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    attemptId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    questionId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    selectedOptionId: {
        type: DataTypes.UUID,
        allowNull: true // For Single MCQ
    },
    selectedOptions: {
        type: DataTypes.JSON,
        allowNull: true // For Multiple Select
    },
    textAnswer: {
        type: DataTypes.TEXT,
        allowNull: true // For Subjective/Numerical
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: true // Null means needs manual grading
    },
    marksAwarded: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = StudentAnswer;
