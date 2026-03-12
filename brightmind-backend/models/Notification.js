const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
        defaultValue: 'info'
    },
    batchId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('Admin', 'Teacher', 'Student', 'All'),
        defaultValue: 'All'
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    referenceId: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Notification;
