const Rumah = require('../models/rumahModel');
const fs = require("fs");
const path = require("path");

exports.getAvailable = (req, res) => {
  Rumah.getAvailable((err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
};

// GET semua rumah
exports.getRumah = (req, res) => {
  Rumah.getAll((err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
};

// GET rumah by id
exports.getRumahById = (req, res) => {
  const { id } = req.params;
  Rumah.getById(id, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!result) return res.status(404).json({ message: 'Rumah tidak ditemukan' });
    res.json(result);
  });
};

// CREATE rumah
exports.createRumah = (req, res) => {
  const { blok_id, nomor_rumah, luas_tanah, luas_bangunan, status, deskripsi } = req.body || {};
  const gambar = req.file ? req.file.filename : null;

  Rumah.create(
    { blok_id, nomor_rumah, luas_tanah, luas_bangunan, status, deskripsi, gambar },
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: "Rumah berhasil ditambahkan" });
    }
  );
};


// UPDATE rumah
exports.updateRumah = (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const gambarBaru = req.file ? req.file.filename : null;

  Rumah.getById(id, (err, old) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!old) return res.status(404).json({ message: "Rumah tidak ditemukan" });

    if (gambarBaru && old.gambar) {
      const oldPath = path.join(__dirname, "..", "uploads", "rumah", old.gambar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    Rumah.update(
      id,
      {
        ...data,
        gambar: gambarBaru, // null atau filename
      },
      (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ message: "Rumah berhasil diupdate" });
      }
    );
  });
};


// DELETE rumah
exports.deleteRumah = (req, res) => {
  const { id } = req.params;
  Rumah.delete(id, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Rumah tidak ditemukan' });
    res.json({ message: 'Rumah berhasil dihapus' });
  });
};

exports.filterRumah = (req, res) => {
  const { status, blok_id, nomor_rumah, luas_tanah, luas_bangunan, } = req.query;

  Rumah.filter({ status, blok_id, nomor_rumah, luas_tanah, luas_bangunan, }, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
};


