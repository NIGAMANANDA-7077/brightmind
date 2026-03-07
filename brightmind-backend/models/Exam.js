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
    courseId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    courseName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    teacherName: {
        type: DataTypes.STRING,
        defaultValue: 'Teacher'
    },
    questions: {
        type: DataTypes.JSON, // Can store array of questions or link to PDF
        allowNull: false
    },
    totalMarks: {
        type: DataTypes.INTEGER,
        defaultValue: 100
    },
    duration: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 60
    },
    status: {
        type: DataTypes.ENUM('Draft', 'Pending Approval', 'Approved', 'Active', 'Completed'),
        defaultValue: 'Draft'
    },
    sections: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    versions: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    lastSaved: {
        type: DataTypes.DATE,
        allowNull: true
    },
    reviewedBy: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reviewNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Exam;
