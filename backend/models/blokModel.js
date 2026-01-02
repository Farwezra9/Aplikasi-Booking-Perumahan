const db = require('../config/db');

exports.getAll = (callback) => {
  db.query('SELECT * FROM blok', (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

exports.getById = (id, callback) => {
  db.query('SELECT * FROM blok WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result[0]);
  });
};

exports.create = (nama_blok, callback) => {
  db.query('INSERT INTO blok (nama_blok) VALUES (?)', [nama_blok], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

exports.update = (id, nama_blok, callback) => {
  db.query('UPDATE blok SET nama_blok = ? WHERE id = ?', [nama_blok, id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

exports.delete = (id, callback) => {
  db.query('DELETE FROM blok WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};
