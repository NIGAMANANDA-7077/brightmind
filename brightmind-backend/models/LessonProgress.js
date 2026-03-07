const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LessonProgress = sequelize.define('LessonProgress', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    studentId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    moduleId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lessonId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['studentId', 'lessonId']
        }
    ]
});

module.exports = LessonProgress;
