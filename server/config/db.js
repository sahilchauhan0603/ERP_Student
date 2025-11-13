require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // Removed invalid options: acquireTimeout, timeout, reconnect
  // These are only valid for connection pools, not single connections
  connectTimeout: 60000, // Valid option for single connections (60 seconds)
  enableKeepAlive: true, // Keep connection alive
  keepAliveInitialDelay: 0 // Start keep-alive immediately
});

connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL');
});

// Handle connection errors and reconnection
connection.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Reconnecting to database...');
  }
});

// Export both callback and promise versions
module.exports = connection;
module.exports.promise = connection.promise();
