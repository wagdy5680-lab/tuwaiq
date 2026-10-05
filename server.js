const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// قراءة بيانات الاتصال من متغيرات البيئة بدلاً من كتابتها صراحة
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to Aiven PostgreSQL:', err.stack);
    } else {
        console.log('Successfully connected to Aiven PostgreSQL database!');
        release();
    }
});

app.get('/api/data', async (req, res) => {
    try {
        const tableName = req.query.table || 'your_table_name'; 
        const result = await pool.query(`SELECT * FROM ${tableName}`);
        
        res.json({
            success: true,
            count: result.rowCount,
            data: result.rows
        });
    } catch (err) {
        console.error('Query Error:', err.message);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});