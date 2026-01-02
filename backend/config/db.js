const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// Membuat pool koneksi
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test koneksi pool
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL GAGAL TERHUBUNG');
    console.error('Pesan error:', err.message);
    return;
  }
  console.log('✅ MySQL Tersambung!');
  connection.release(); // jangan lupa release koneksi kembali ke pool
});

module.exports = db;
