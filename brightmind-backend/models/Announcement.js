const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Announcement = sequelize.define('Announcement', {
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
    audience: {
        type: DataTypes.ENUM('All', 'Students', 'Teachers'),
        defaultValue: 'All'
    },
    status: {
        type: DataTypes.ENUM('Published', 'Draft', 'Scheduled'),
        defaultValue: 'Published'
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    postedBy: {
        type: DataTypes.STRING,
        allowNull: true
    },
    batchId: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Announcement;
