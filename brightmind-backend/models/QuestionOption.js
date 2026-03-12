const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuestionOption = sequelize.define('QuestionOption', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    questionId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    optionText: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true
});

module.exports = QuestionOption;
