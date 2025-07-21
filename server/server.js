const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db'); // MySQL connection file

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
const allowedOrigins = [
  'https://erp-student-sm4v.onrender.com',
  'http://localhost:3000',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    // Respond to preflight
    return res.sendStatus(200);
  }

  next();
});


app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
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
