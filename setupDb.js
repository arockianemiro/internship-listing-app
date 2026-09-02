const fs = require('fs');
const path = require('path');
const pool = require('./config/db'); // Adjust path if db.js is located elsewhere

async function setupDatabase() {
    try {
        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

        console.log('⏳ Creating tables...');
        await pool.query(schemaSql);
        console.log('✅ Schema executed successfully.');

        console.log('⏳ Seeding initial data...');
        await pool.query(seedSql);
        console.log('✅ Seed data inserted successfully.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        process.exit(1);
    }
}

setupDatabase();