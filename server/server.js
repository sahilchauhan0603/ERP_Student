const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./config/db'); // MySQL connection file
const { startScheduler } = require('./schedulers/siteSchedular');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 9080;

// Trust proxy for rate limiting (needed for Render deployment)
app.set('trust proxy', 1);

// CORS Configuration
const allowedOrigins = [
  'https://erp-student-sm4v.onrender.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://www.erpstudent.tech',
  'https://erpstudent.tech',
  'https://erp-student.bpitindia.com',
  // 'https://verla-nymphean-sylvie.ngrok-free.dev',
];

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));


app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(__dirname + '/uploads'));

// Error handling middleware for CORS
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed'
    });
  }
  next(err);
});


// Student and admin routes
app.use('/api/student', require('./routes/student'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/sar', require('./routes/sar'));

// // Test route
// app.get('/', (req, res) => {
//   res.send('✅ MySQL API is running.....');
// });

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // startScheduler();
});
