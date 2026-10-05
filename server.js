const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();

// إعداد الاتصال بـ Aiven PostgreSQL
const connectionString = process.env.DATABASE_URL || 
  `postgres://${process.env.AIVEN_USER}:${process.env.AIVEN_PASSWORD}@${process.env.AIVEN_HOST}:${process.env.AIVEN_PORT}/${process.env.AIVEN_DB}?sslmode=require`;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// إتاحة الملفات الثابتة
app.use(express.static(path.join(__dirname)));

// مسار API لجلب البيانات من الـ View
app.get('/api/get-data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "بحث_شامل_الشركات"');
    res.json(result.rows);
  } catch (err) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', err);
    res.status(500).json({ error: 'تعذر جلب البيانات من Aiven', details: err.message });
  }
});

// توجيه الصفحة الرئيسية إلى index.html مباشرة
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
