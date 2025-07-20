const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db'); // MySQL connection file

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
const allowedOrigins = [
  'https://erp-student-sm4v.onrender.com', // your frontend
  'http://localhost:5173', // local development
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use('/uploads', express.static(__dirname + '/uploads'));


// Student and admin routes
app.use('/api/student', require('./routes/student'));
app.use('/api/admin', require('./routes/admin'));

// Test route
app.get('/', (req, res) => {
  res.send('✅ MySQL API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
