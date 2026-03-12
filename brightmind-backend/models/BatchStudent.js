const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BatchStudent = sequelize.define('BatchStudent', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    batchId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    studentId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    tableName: 'batch_students',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['batchId', 'studentId']
        }
    ]
});

module.exports = BatchStudent;
