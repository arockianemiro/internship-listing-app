const { Pool } = require('pg');
const path = require('path');

// Ensure .env is loaded from the root directory
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'internship_db',
    password: String(process.env.DB_PASSWORD || ''), // Prevents SASL null/undefined error
    port: Number(process.env.DB_PORT || 5432),
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

module.exports = pool;