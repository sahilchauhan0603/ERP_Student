// Run this script once to create the students table in your MySQL database
const db = require('../config/db');
const schema = require('./student');

db.query(schema, (err, result) => {
  if (err) {
    // Table creation failed
  } else {
    // Students table created or already exists
  }
  process.exit();
});
