// Backend/server.js (ฉบับแก้ไขล่าสุด)

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const db = require('./database.js');
const dataProcessor = require('./dataProcessor.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_super_secret_key_change_this';

app.use(cors());
app.use(express.json());

// ให้บริการไฟล์จากโฟลเดอร์ Frontend
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

// --- Multer Setup for file uploads ---
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes("excel") || file.mimetype.includes("spreadsheetml")) {
            cb(null, true);
        } else {
            cb(new Error("Please upload only excel file."), false);
        }
    }
});

// --- Authentication ---
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = jwt.sign({ username: username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ success: true, token: token });
    } else {
        res.status(401).json({ success: false, message: 'Incorrect username or password.' });
    }
});

// --- Admin Middleware ---
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err || user.role !== 'admin') return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- API Routes ---
app.get('/companies', (req, res) => {
    db.all("SELECT name FROM companies ORDER BY name", [], (err, rows) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(rows.map(row => row.name));
    });
});

app.get('/company/:companyName', (req, res) => {
    const { companyName } = req.params;
    const sql = "SELECT data FROM company_data WHERE company_name = ?";
    db.get(sql, [companyName], (err, row) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!row || !row.data) {
            return res.json({ processedData: [], activeStations: [] });
        }
        res.json(JSON.parse(row.data));
    });
});

// POST create a new company (แก้ไขให้ถูกต้อง)
app.post('/company', verifyAdmin, (req, res) => {
    const { companyName } = req.body;
    if (!companyName) return res.status(400).json({ message: "Company name is required." });

    const shareToken = crypto.randomBytes(16).toString('hex');
    const emptyData = JSON.stringify({ processedData: [], activeStations: [] });

    db.serialize(() => {
        // ใช้ transaction เพื่อให้แน่ใจว่าทำสำเร็จทั้ง 2 ตาราง
        db.run('BEGIN TRANSACTION');
        
        let failed = false;
        
        // 1. เพิ่มชื่อบริษัทในตาราง companies
        const companiesSql = "INSERT INTO companies (name, share_token) VALUES (?, ?)";
        db.run(companiesSql, [companyName, shareToken], function(err) {
            if (err) {
                failed = true;
                db.run('ROLLBACK');
                return res.status(409).json({ message: "Company already exists." });
            }
        });

        // 2. สร้างข้อมูลว่างในตาราง company_data
        const companyDataSql = "INSERT INTO company_data (company_name, data) VALUES (?, ?)";
        db.run(companyDataSql, [companyName, emptyData], function(err) {
            if (err) {
                failed = true;
                db.run('ROLLBACK');
                return res.status(500).json({ message: "Failed to initialize company data." });
            }
        });
        
        db.run('COMMIT', (err) => {
            if (err || failed) return;
            res.status(201).json({ message: "Company created successfully." });
        });
    });
});

app.delete('/company/:companyName', verifyAdmin, (req, res) => {
    const { companyName } = req.params;
    db.serialize(() => {
        db.run("DELETE FROM companies WHERE name = ?", [companyName]);
        db.run("DELETE FROM company_data WHERE company_name = ?", [companyName]);
        res.json({ message: `Company '${companyName}' deleted successfully.` });
    });
});

// POST upload and process excel file (แก้ไขให้ถูกต้อง)
app.post('/upload', verifyAdmin, upload.single('excel-file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    
    const { companyName } = req.body;
    if (!companyName) return res.status(400).json({ message: "Company name is required." });

    try {
        const processedResult = await dataProcessor.handleFile(req.file.buffer);
        const dataJson = JSON.stringify(processedResult);
        
        // ใช้ "UPSERT" (UPDATE or INSERT) เพื่อความปลอดภัย
        const sql = `
            INSERT INTO company_data (company_name, data) VALUES (?, ?)
            ON CONFLICT(company_name) DO UPDATE SET data = excluded.data`;
        
        db.run(sql, [companyName, dataJson], function(err) {
             if (err) throw new Error("Database error: " + err.message);
             res.json({
                message: "File processed and saved successfully!",
                data: processedResult
             });
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: error.message || "An error occurred during file processing." });
    }
});

// Shareable Link Routes (เหมือนเดิม)
app.get('/company/:companyName/token', verifyAdmin, (req, res) => {
     db.get("SELECT share_token FROM companies WHERE name = ?", [req.params.companyName], (err, row) => {
        if (err) return res.status(500).json({ message: err.message });
        if (!row) return res.status(404).json({ message: "Company not found." });
        res.json({ shareToken: row.shareToken });
    });
});

app.put('/company/:companyName/token', verifyAdmin, (req, res) => {
    const newShareToken = crypto.randomBytes(16).toString('hex');
    db.run("UPDATE companies SET share_token = ? WHERE name = ?", [newShareToken, req.params.companyName], function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ shareToken: newShareToken });
    });
});

// Route สุดท้ายสำหรับส่งหน้าเว็บ
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});