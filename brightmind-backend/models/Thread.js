const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Thread = sequelize.define('Thread', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    batchId: {
        type: DataTypes.UUID,
        allowNull: true // Can be null if it's a general course discussion
    },
    authorId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    authorName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    authorRole: {
        type: DataTypes.STRING,
        defaultValue: 'Student'
    },
    authorAvatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    upvotes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('Open', 'Closed', 'Resolved'),
        defaultValue: 'Open'
    },
    tags: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    repliesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = Thread;
