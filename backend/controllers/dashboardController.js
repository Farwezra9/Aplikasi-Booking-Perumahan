const db = require('../config/db');

exports.getperum = (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM users) AS total_user,
      (SELECT COUNT(*) FROM blok) AS total_blok,
      (SELECT COUNT(*) FROM rumah) AS total_rumah,
      (SELECT COUNT(*) FROM rumah WHERE status='tersedia') AS tersedia,
      (SELECT COUNT(*) FROM rumah WHERE status='dipesan') AS dipesan,
      (SELECT COUNT(*) FROM rumah WHERE status='terjual') AS terjual
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result[0]);
  });
};

exports.getStats = (req, res) => {
  const sql = `
    SELECT 
      MONTH(created_at) AS bulan_num,
      DATE_FORMAT(created_at, '%b') AS bulan,
      COUNT(*) AS jumlah
    FROM booking
    WHERE status = 'terjual'
    GROUP BY MONTH(created_at)
    ORDER BY MONTH(created_at)
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal mengambil data statistics terjual' });
    }

    
    const allMonths = [
      'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
    ];

    const result = allMonths.map((m, i) => {
      const found = rows.find(row => row.bulan_num === i + 1);
      return { bulan: m, jumlah: found ? found.jumlah : 0 };
    });

    res.json(result);
  });
};

exports.getlat = (req, res) => {
  const sql = `
    SELECT 
      u.name AS user_name,
      CONCAT('BLOK ', b.nama_blok, ' - NO ', r.nomor_rumah) AS rumah,
      DATE_FORMAT(bk.created_at, '%Y-%m-%d') AS tanggal,
      bk.status
    FROM booking bk
    JOIN users u ON u.id = bk.user_id
    JOIN rumah r ON r.id = bk.rumah_id
    JOIN blok b ON b.id = r.blok_id
    ORDER BY bk.created_at DESC
    LIMIT 5
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }

    res.json(rows);
  });
};
