const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LiveClass = sequelize.define('LiveClass', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    course: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: false
    },
    platform: {
        type: DataTypes.STRING,
        allowNull: false
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Upcoming', 'Live', 'Completed'),
        defaultValue: 'Upcoming'
    },
    isLive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    studentsJoined: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    mentor: {
        type: DataTypes.STRING,
        defaultValue: 'Teacher'
    },
    avatar: {
        type: DataTypes.STRING,
        defaultValue: 'https://ui-avatars.com/api/?name=Teacher'
    }
}, {
    timestamps: true
});

module.exports = LiveClass;
