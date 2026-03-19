const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AdminActivityLog = sequelize.define('AdminActivityLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    adminId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    moduleName: {
        type: DataTypes.STRING(50),
        allowNull: true  // course, exam, batch, user, settings, announcement
    },
    actionType: {
        type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'OTHER'),
        allowNull: false,
        defaultValue: 'OTHER'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'admin_activity_logs'
});

module.exports = AdminActivityLog;
