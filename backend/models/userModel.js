const db = require('../config/db');

const baseSelect = 'SELECT id, name, email, role, status FROM users';

exports.create = (data, callback) => {
  const { name, email, password, role, status } = data;
  const sql = 'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, email, password, role, status], (err, result) => {
    if (err) return callback(err);
    db.query('SELECT id, name, email, role, status FROM users WHERE id = ?', [result.insertId], (err2, rows) => {
      if (err2) return callback(err2);
      callback(null, rows[0]);
    });
  });
};

exports.findByEmail = (email, callback) => {
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0]);
  });
};

exports.getAll = (callback) => {
  db.query(baseSelect, (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

exports.getById = (id, callback) => {
  db.query(`${baseSelect} WHERE id = ?`, [id], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0]);
  });
};

exports.update = (id, data, callback) => {
  const { name, email, role, status } = data;
  db.query(
    'UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?',
    [name, email, role, status, id],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    }
  );
};

exports.delete = (id, callback) => {
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err);
    callback(null, { message: 'User deleted' });
  });
};
