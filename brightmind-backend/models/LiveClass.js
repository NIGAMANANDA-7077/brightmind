const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LiveClass = sequelize.define('LiveClass', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    teacherId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    batchId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    meetingLink: {
        type: DataTypes.STRING,
        allowNull: false
    },
    classDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    startTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duration: {
        type: DataTypes.STRING,
        defaultValue: '60 minutes'
    },
    status: {
        type: DataTypes.ENUM('Upcoming', 'Live', 'Completed'),
        defaultValue: 'Upcoming'
    },
    recordingUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tenantId: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    tableName: 'live_classes',
    timestamps: true
});

module.exports = LiveClass;
