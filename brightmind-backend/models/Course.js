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
        type: DataTypes.UUID,
        allowNull: true
    },
    thumbnail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // modules: {
    //     type: DataTypes.JSON,
    //     defaultValue: []
    // },
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
    detailedDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    syllabusText: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    syllabusUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: true
    },
    level: {
        type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
        defaultValue: 'Beginner'
    },
    learningOutcomes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true
    },
    createdByAdminName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    tenantId: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Course;
