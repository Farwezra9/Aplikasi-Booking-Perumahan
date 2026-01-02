const db = require('../config/db');

exports.create = (data, callback) => {
  const { rumah_id, user_id, tanggal_kunjungan, kontak, catatan } = data;

  // cek rumah tersedia dulu
  db.query(
    'INSERT INTO booking (rumah_id, user_id, tanggal_kunjungan, kontak, catatan, status) VALUES (?, ?, ?, ?, ?, ?)',
    [rumah_id, user_id, tanggal_kunjungan, kontak, catatan || '', 'menunggu'],
    (err, res) => {
      if (err) return callback(err);
      callback(null, res);
    }
  );
};

exports.checkDuplicateBooking = (user_id, rumah_id, callback) => {
  const query = `
    SELECT id 
    FROM booking 
    WHERE user_id = ? 
      AND rumah_id = ?
      AND status != 'dibatalkan'
    LIMIT 1
  `;
  db.query(query, [user_id, rumah_id], callback);
};

exports.getAll = (callback) => {
  const query = `
    SELECT b.*, r.nomor_rumah AS nomor_rumah, r.status AS status_rumah, bl.nama_blok, u.name AS user_name
    FROM booking b
    JOIN rumah r ON b.rumah_id = r.id
    JOIN blok bl ON r.blok_id = bl.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
  `;
  db.query(query, callback);
};

exports.updateStatus = (id, status, callback) => {
  // update booking status
  db.query('UPDATE booking SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return callback(err);

    if (status === 'dikonfirmasi') {
      // update status rumah
      db.query(
        'UPDATE rumah SET status = ? WHERE id = (SELECT rumah_id FROM booking WHERE id = ?)',
        ['dipesan', id],
        (err2) => {
          if (err2) return callback(err2);

          // batalkan booking lain yang masih waiting untuk rumah yang sama
          db.query(
            'UPDATE booking SET status = ? WHERE rumah_id = (SELECT rumah_id FROM booking WHERE id = ?) AND id != ? AND status = ?',
            ['dibatalkan', id, id, 'menunggu'],
            callback
          );
        }
      );
    } else if (status === 'dibatalkan') {
      // jika di-cancel, rumah dikembalikan ke tersedia
      db.query(
        'UPDATE rumah SET status = ? WHERE id = (SELECT rumah_id FROM booking WHERE id = ?)',
        ['tersedia', id],
        callback
      );
    } else if (status === 'terjual') {
      // update rumah jadi terjual dan update created_at booking ke hari ini
      const today = new Date();
      const formattedDate = today.toISOString().slice(0, 19).replace('T', ' '); // format MySQL YYYY-MM-DD HH:MM:SS

      db.query(
        'UPDATE rumah SET status = ? WHERE id = (SELECT rumah_id FROM booking WHERE id = ?)',
        ['terjual', id],
        (err2) => {
          if (err2) return callback(err2);

          db.query(
            'UPDATE booking SET created_at = ? WHERE id = ?',
            [formattedDate, id],
            callback
          );
        }
      );
    } else {
      callback(null);
    }
  });
};

exports.updateStatusUser = (id, user_id, status, callback) => {
  // hanya boleh cancel / dibatalkan
  if (status !== 'dibatalkan') return callback(new Error("User hanya boleh membatalkan booking"));

  // cek booking milik user
  db.query('SELECT * FROM booking WHERE id = ? AND user_id = ?', [id, user_id], (err, res) => {
    if (err) return callback(err);
    if (res.length === 0) return callback(new Error("Booking tidak ditemukan atau bukan milik user"));

    // update status booking
    db.query('UPDATE booking SET status = ? WHERE id = ?', [status, id], (err2) => {
      if (err2) return callback(err2);

      // kembalikan rumah ke tersedia
      db.query(
        'UPDATE rumah SET status = ? WHERE id = (SELECT rumah_id FROM booking WHERE id = ?)',
        ['tersedia', id],
        callback
      );
    });
  });
};

exports.getByUser = (user_id, callback) => {
  const query = `
    SELECT b.*, r.nomor_rumah AS nomor_rumah, r.status AS status_rumah, bl.nama_blok
    FROM booking b
    JOIN rumah r ON b.rumah_id = r.id
    JOIN blok bl ON r.blok_id = bl.id
    WHERE b.user_id = ?
  `;
  db.query(query, [user_id], callback);
};
