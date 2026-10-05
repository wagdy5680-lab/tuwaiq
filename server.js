// تعليق فحص شهادات SSL الذاتية لبيئة Vercel
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();

// تنظيف رابط الاتصال من أي معاملات قد تتعارض مع pg
let connectionString = process.env.DATABASE_URL || '';
if (connectionString.includes('?')) {
  connectionString = connectionString.split('?')[0];
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// إتاحة الملفات الثابتة
app.use(express.static(path.join(__dirname)));

// مسار API لجلب البيانات من الفيو بتركيب Schema.View الصحيح
app.get('/api/get-data', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('لم يتم قراءة متغير DATABASE_URL من Vercel.');
    }
    // فصل الـ Schema عن اسم الـ View بنقطة
    const result = await pool.query('SELECT * FROM "public"."بحث_شامل_الشركات"');
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
