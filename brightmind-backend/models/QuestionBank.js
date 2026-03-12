const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuestionBank = sequelize.define('QuestionBank', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    courseId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    topic: {
        type: DataTypes.STRING,
        allowNull: true
    },
    teacherId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    questionText: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    questionType: {
        type: DataTypes.ENUM('MCQ', 'Multiple Select', 'True False', 'Short Answer', 'Long Answer', 'Numerical'),
        defaultValue: 'MCQ'
    },
    difficulty: {
        type: DataTypes.ENUM('Easy', 'Medium', 'Hard'),
        defaultValue: 'Medium'
    },
    marks: {
        type: DataTypes.FLOAT,
        defaultValue: 1
    },
    negativeMarks: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    explanation: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = QuestionBank;
