const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('Active', 'Draft', 'Archived'),
        defaultValue: 'Active'
    },
    teacherId: {
        type: DataTypes.STRING, // Skipping foreign key checks for now to keep it simple without auth
        allowNull: true
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    modules: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    materials: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    studentsEnrolled: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    youtubeUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Course;
