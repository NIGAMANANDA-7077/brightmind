const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExamQuestion = sequelize.define('ExamQuestion', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    examId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    questionId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    marks: {
        type: DataTypes.FLOAT,
        allowNull: true // If null, derives from QuestionBank
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    sectionName: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = ExamQuestion;
