const { Sequelize } = require('sequelize');
require('dotenv').config();

// ============================================================
// Database connection using Sequelize ORM
// Replace .env values with your actual MySQL credentials
// ============================================================

console.log("--- DB Connection Debug ---");
console.log("DB Name:", process.env.DB_NAME || process.env.MYSQLDATABASE || 'brightmind_db');
console.log("DB User:", process.env.DB_USER || process.env.MYSQLUSER || 'root');
console.log("DB Host:", process.env.DB_HOST || process.env.MYSQLHOST || 'localhost');
console.log("DB Port:", process.env.DB_PORT || process.env.MYSQLPORT || 3306);
console.log("---------------------------");

const sequelize = new Sequelize(
    process.env.DB_NAME || process.env.MYSQLDATABASE || 'brightmind_db',
    process.env.DB_USER || process.env.MYSQLUSER || 'root',
    process.env.DB_PASS || process.env.MYSQLPASSWORD || '',
    {
        host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
        port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

module.exports = sequelize;
