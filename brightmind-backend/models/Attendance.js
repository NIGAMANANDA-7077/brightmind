const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    studentId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    liveClassId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    batchId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'present'
    },
    joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    markedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    durationMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['studentId', 'liveClassId']
        }
    ]
});

module.exports = Attendance;
