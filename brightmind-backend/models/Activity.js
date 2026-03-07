const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Activity = sequelize.define('Activity', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    target: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Activity;
