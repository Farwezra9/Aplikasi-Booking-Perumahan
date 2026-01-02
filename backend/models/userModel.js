const db = require('../config/db');
exports.create = (data, callback) => {
  const { name, email, password, role, status } = data;

  const sql = 'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, email, password, role, status], (err, result) => {
    if (err) return callback(err, null);
    db.query(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [result.insertId],
      (err2, rows) => {
        if (err2) return callback(err2, null);
        callback(null, rows[0]); 
      }
    );
  });
};

exports.getAll = (callback) => {
  db.query('SELECT id, name, email, role, status FROM users', (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

exports.getById = (id, callback) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result[0]);
  });
};

exports.update = (id, data, callback) => {
  const { name, email, role, status } = data;
  db.query(
    'UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?', [name, email, role, status, id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

exports.delete = (id, callback) => {
  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

exports.findByEmail = (email, callback) => {
  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, rows) => callback(err, rows?.[0])
  );
};
