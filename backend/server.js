require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const studentRoutes = require('./routes/studentRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 10000;

// ============ CORS bảo mật: chỉ cho phép các domain Netlify của Frontend ============
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Cho phép request không có origin (Postman, server-to-server, health check)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Chặn request từ origin không được phép: ${origin}`);
    return callback(new Error('Không được phép truy cập bởi chính sách CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ============ Health check (Render dùng để kiểm tra server sống) ============
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Vocabulary API is running.' });
});
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// ============ Mount routes ============
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/attempts', attemptRoutes);

// ============ 404 & Error handler (luôn đặt cuối cùng) ============
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại cổng ${PORT}`);
  console.log(`✅ CORS cho phép các origin: ${allowedOrigins.join(', ') || '(chưa cấu hình)'}`);
});
