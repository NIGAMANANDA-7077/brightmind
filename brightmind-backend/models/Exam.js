const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Exam = sequelize.define('Exam', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    courseId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    batchId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    teacherId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    examType: {
        type: DataTypes.ENUM('Quiz', 'Practice Test', 'Mid Exam', 'Final Exam'),
        defaultValue: 'Quiz'
    },
    duration: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 60
    },
    totalMarks: {
        type: DataTypes.FLOAT,
        defaultValue: 100
    },
    passingMarks: {
        type: DataTypes.FLOAT,
        defaultValue: 33
    },
    negativeMarking: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    randomizeQuestions: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    randomizeOptions: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Draft', 'Active', 'Completed'),
        defaultValue: 'Draft'
    },
    tenantId: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Exam;
