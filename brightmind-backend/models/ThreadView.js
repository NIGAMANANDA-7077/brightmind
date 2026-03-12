const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ThreadView = sequelize.define('ThreadView', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    threadId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['threadId', 'userId']
        }
    ]
});

module.exports = ThreadView;
