const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    studentId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('Admin', 'Teacher', 'Student', 'SuperAdmin'),
        defaultValue: 'Student'
    },
    avatar: {
        type: DataTypes.STRING,
        defaultValue: 'https://ui-avatars.com/api/?name=User&background=random'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    linkedinUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    twitterUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    facebookUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    qualification: {
        type: DataTypes.STRING,
        allowNull: true
    },
    experience: {
        type: DataTypes.STRING,
        allowNull: true
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: true
    },
    batch: {
        type: DataTypes.STRING,
        allowNull: true
    },
    batchId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    tenantId: {
        type: DataTypes.UUID,
        allowNull: true  // null for SuperAdmin (platform-level)
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Suspended'),
        defaultValue: 'Active'
    },
    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    mustChangePassword: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    totalHoursLearned: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    monthlyProgress: {
        type: DataTypes.JSON, // Array of { name: 'Week X', hours: Y }
        defaultValue: [
            { name: 'Week 1', hours: 0 },
            { name: 'Week 2', hours: 0 },
            { name: 'Week 3', hours: 0 },
            { name: 'Week 4', hours: 0 }
        ]
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Instance method to check password
User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
