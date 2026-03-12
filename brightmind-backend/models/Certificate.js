const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Certificate = sequelize.define('Certificate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    studentId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    issueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    certificateUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    issuedBy: {
        type: DataTypes.STRING, // Admin who issued it
        allowNull: true
    },
    grade: {
        type: DataTypes.STRING,
        allowNull: true
    },
    scores: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['studentId', 'courseId']
        }
    ]
});

module.exports = Certificate;
