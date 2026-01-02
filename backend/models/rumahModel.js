const db = require('../config/db');

exports.getAvailable = (callback) => {
  const query = `
    SELECT r.*, b.nama_blok
    FROM rumah r
    JOIN blok b ON r.blok_id = b.id
    WHERE r.status = 'tersedia'
  `;
  db.query(query, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

// Ambil semua rumah beserta nama blok
exports.getAll = (callback) => {
  const query = `
    SELECT 
      rumah.id AS id, 
      rumah.nomor_rumah, 
      rumah.gambar,
      rumah.luas_tanah, 
      rumah.luas_bangunan, 
      rumah.status, 
      rumah.deskripsi, 
      blok.id AS blok_id, 
      blok.nama_blok
    FROM rumah
    JOIN blok ON rumah.blok_id = blok.id
    ORDER BY blok.nama_blok, rumah.nomor_rumah ASC
  `;
  db.query(query, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};


// Ambil rumah by id
exports.getById = (id, callback) => {
  const query = `
    SELECT rumah.id, rumah.nomor_rumah, rumah.luas_tanah, rumah.luas_bangunan, rumah.status, rumah.gambar, rumah.deskripsi, blok.nama_blok
    FROM rumah
    JOIN blok ON rumah.blok_id = blok.id
    WHERE rumah.id = ?
  `;
  db.query(query, [id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result[0]);
  });
};

// Tambah rumah
exports.create = (data, callback) => {
  const { blok_id, nomor_rumah, luas_tanah, luas_bangunan, status, gambar, deskripsi } = data;
  db.query(
    'INSERT INTO rumah (blok_id, nomor_rumah, luas_tanah, luas_bangunan, status, gambar, deskripsi) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [blok_id, nomor_rumah, luas_tanah, luas_bangunan, status, gambar, deskripsi],
    (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    }
  );
};

// Update rumah
exports.update = (id, data, callback) => {
  const { blok_id, nomor_rumah, luas_tanah, luas_bangunan, status, deskripsi, gambar } = data;

  let sql = `UPDATE rumah SET blok_id = ?, nomor_rumah = ?, luas_tanah = ?, luas_bangunan = ?, status = ?, deskripsi = ?`;
  const params = [blok_id, nomor_rumah, luas_tanah, luas_bangunan, status, deskripsi];

  if (gambar) {
    sql += `, gambar = ?`;
    params.push(gambar);
  }

  sql += ` WHERE id = ?`;
  params.push(id);

  db.query(sql, params, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};



// Hapus rumah
exports.delete = (id, callback) => {
  db.query('DELETE FROM rumah WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

exports.filter = ({ status, blok_id, nomor_rumah }, callback) => {
  let query = 'SELECT r.*, b.nama_blok FROM rumah r JOIN blok b ON r.blok_id = b.id WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND r.status = ?';
    params.push(status);
  }

  if (blok_id) {
    query += ' AND r.blok_id = ?';
    params.push(blok_id);
  }

  if (nomor) {
    query += ' AND r.nomor_rumah LIKE ?';
    params.push(`%${nomor}%`);
  }

  db.query(query, params, callback);
};

