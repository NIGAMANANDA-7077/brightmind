const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SuperAdminActivityLog = sequelize.define('SuperAdminActivityLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    superadminId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        field: 'superadmin_id'
    },
    adminId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        },
        field: 'admin_id'
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'superadmin_activity_logs',
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at'
});

module.exports = SuperAdminActivityLog;
