const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Enrollment = sequelize.define('Enrollment', {
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
    status: {
        type: DataTypes.ENUM('Active', 'Completed', 'Dropped'),
        defaultValue: 'Active'
    },
    progressPercentage: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    enrolledAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['studentId', 'courseId'] // A student can only enroll in a course once
        }
    ]
});

module.exports = Enrollment;
