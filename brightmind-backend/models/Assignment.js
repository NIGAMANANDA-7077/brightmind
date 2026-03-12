const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Assignment = sequelize.define('Assignment', {
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
    deadline: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    totalMarks: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending'
    },
    submission: {
        type: DataTypes.JSON,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        defaultValue: 'File'
    },
    questions: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    batchId: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Assignment;
