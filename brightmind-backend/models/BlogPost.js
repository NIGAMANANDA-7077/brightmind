const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BlogPost = sequelize.define('BlogPost', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    excerpt: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'General'
    },
    readTime: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Published', 'Draft'),
        defaultValue: 'Draft'
    },
    authorId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    authorName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    authorAvatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true
});

module.exports = BlogPost;
