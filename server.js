const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();

// إعداد الاتصال باستخدام DATABASE_URL بشكل مباشر
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// إتاحة الملفات الثابتة
app.use(express.static(path.join(__dirname)));

// مسار API لجلب البيانات من الفيو
app.get('/api/get-data', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('متغير البيئة DATABASE_URL غير مضاف في لوحة تحكم Vercel');
    }
    const result = await pool.query('SELECT * FROM "public_بحث_شامل_الشركات"');
    res.json(result.rows);
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ 
      error: 'تعذر جلب البيانات من Aiven', 
      details: err.message || err.toString() 
    });
  }
});

// توجيه الصفحة الرئيسية إلى index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
