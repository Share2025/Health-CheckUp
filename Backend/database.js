// backend/database.js (ฉบับแก้ไข)

const sqlite3 = require('sqlite3').verbose();
const DB_PATH = './health_data.db';

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('✅ Connected to the SQLite database.');
        db.serialize(() => {
            // ปรับปรุงตาราง employees ให้ถูกต้อง
            const createCompanyDataTableSQL = `
            CREATE TABLE IF NOT EXISTS company_data (
                company_name TEXT PRIMARY KEY NOT NULL,
                data TEXT
            )`;
            db.run(createCompanyDataTableSQL, (err) => {
                if (err) console.error('Error creating company_data table:', err.message);
                else console.log("✅ 'company_data' table is ready.");
            });

            const createCompaniesTableSQL = `
            CREATE TABLE IF NOT EXISTS companies (
                name TEXT PRIMARY KEY NOT NULL,
                share_token TEXT
            )`;
            db.run(createCompaniesTableSQL, (err) => {
                if (err) console.error('Error creating companies table:', err.message);
                else console.log("✅ 'companies' table is ready.");
            });
        });
    }
});

module.exports = db;