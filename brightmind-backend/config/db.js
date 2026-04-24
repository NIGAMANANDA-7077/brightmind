const { Sequelize } = require('sequelize');
require('dotenv').config();

// ============================================================
// Database connection using Sequelize ORM
// Supports full connection URL (MYSQL_URL or DATABASE_URL)
// or individual credentials (DB_HOST, DB_USER, etc.)
// ============================================================

const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

let sequelize;

if (connectionUrl) {
    // Use full connection URL (best for Render + Railway MySQL)
    console.log("--- DB Connection Debug ---");
    console.log("Using connection URL:", connectionUrl.replace(/:([^:@]+)@/, ':****@'));
    console.log("---------------------------");

    sequelize = new Sequelize(connectionUrl, {
        dialect: 'mysql',
        dialectOptions: {
            ssl: false,
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    });
} else {
    // Fallback: use individual credentials
    console.log("--- DB Connection Debug ---");
    console.log("DB Name:", process.env.DB_NAME || process.env.MYSQLDATABASE || 'brightmind_db');
    console.log("DB User:", process.env.DB_USER || process.env.MYSQLUSER || 'root');
    console.log("DB Host:", process.env.DB_HOST || process.env.MYSQLHOST || 'localhost');
    console.log("DB Port:", process.env.DB_PORT || process.env.MYSQLPORT || 3306);
    console.log("---------------------------");

    sequelize = new Sequelize(
        process.env.DB_NAME || process.env.MYSQLDATABASE || 'lms_database',
        process.env.DB_USER || process.env.MYSQLUSER || 'root',
        process.env.DB_PASS || process.env.MYSQLPASSWORD || '',
        {
            host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
            port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
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
}

module.exports = sequelize;
