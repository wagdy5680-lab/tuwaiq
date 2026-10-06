// تعليق فحص شهادات SSL الذاتية لبيئة Vercel
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();

// تنظيف رابط الاتصال
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

// السماح بقراءة الملفات الثابتة من المجلد الحالي
app.use(express.static(path.join(__dirname)));

// مسار لجلب قائمة جميع الجداول والفيوز المتاحة في قاعدة البيانات
app.get('/api/tables', async (req, res) => {
  try {
    const queryText = `
      SELECT table_schema, table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_type, table_name;
    `;
    const result = await pool.query(queryText);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// مسار API لجلب البيانات من الفيو المطلوب
app.get('/api/get-data', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('لم يتم قراءة متغير DATABASE_URL من Vercel.');
    }
    // تجربة اسم الفيو أو الجدول
    const tableName = req.query.name || 'بحث_شامل_الشركات';
    const result = await pool.query(`SELECT * FROM "${tableName}"`);
    res.json(result.rows);
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ 
      error: 'تعذر جلب البيانات من Aiven', 
      details: err.message || err.toString() 
    });
  }
});

// --- مسارات الصفحات المتعددة لمنع خطأ Cannot GET ---

// 1. مسار الصفحة الرئيسية (البوابة)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. مسار صفحة لوحة التحكم
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// 3. مسار إضافي لأي صفحة مستقبلية (مثال: صفحة التقارير أو الإعدادات)
app.get('/settings.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'settings.html'));
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
