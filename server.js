const express = require('express');
const { Pool } = require('pg');
const app = express();

// إعداد الاتصال بـ Aiven PostgreSQL عبر SSL
const pool = new Pool({
  host: process.env.AIVEN_HOST,
  port: process.env.AIVEN_PORT,
  database: process.env.AIVEN_DB,
  user: process.env.AIVEN_USER,
  password: process.env.AIVEN_PASSWORD,
  ssl: {
    rejectUnauthorized: false // مطلوب لاتصال SSL الآمن مع Aiven
  }
});

// إتاحة الملفات الثابتة (مثل index.html)
app.use(express.static(__dirname));

// مسار API لجلب البيانات من الـ View
app.get('/api/get-data', async (req, res) => {
  try {
    // الاستعلام المباشر من الفيو: بحث_شامل_الشركات
    const result = await pool.query('SELECT * FROM "بحث_شامل_الشركات"');
    res.json(result.rows);
  } catch (err) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', err);
    res.status(500).json({ error: 'تعذر جلب البيانات من Aiven' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
