const db = require('../config/db');

exports.getProfileById = (id, callback) => {
  const sql = 'SELECT id, name, email, alamat, notelp FROM users WHERE id = ?';
  db.query(sql, [id], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0]);
  });
};

exports.updateProfile = (id, data, callback) => {
  const { name, alamat, notelp } = data;

  const sql = `
    UPDATE users 
    SET name = ?, alamat = ?, notelp = ?
    WHERE id = ?
  `;

  db.query(sql, [name, alamat, notelp, id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};