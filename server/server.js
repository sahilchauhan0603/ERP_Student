const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db'); // MySQL connection file

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
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
