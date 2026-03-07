const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Multiple Choice', 'True/False', 'Subjective'),
        defaultValue: 'Multiple Choice'
    },
    topic: {
        type: DataTypes.STRING,
        allowNull: false
    },
    difficulty: {
        type: DataTypes.ENUM('Easy', 'Medium', 'Hard'),
        defaultValue: 'Medium'
    },
    options: {
        type: DataTypes.JSON, // For MCQ options
        allowNull: true
    },
    correctAnswer: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    marks: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    lastEdited: {
        type: DataTypes.STRING,
        defaultValue: 'Just now'
    }
}, {
    timestamps: true
});

module.exports = Question;
