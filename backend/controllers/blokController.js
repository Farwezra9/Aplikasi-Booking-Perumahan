const Blok = require('../models/blokModel');

// GET semua blok
exports.getAll = (req, res) => {
  Blok.getAll((err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
};

// GET blok by id
exports.getById = (req, res) => {
  const { id } = req.params;
  Blok.getById(id, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!result) return res.status(404).json({ message: 'Blok tidak ditemukan' });
    res.json(result);
  });
};

// CREATE blok
exports.create = (req, res) => {
  const { nama_blok } = req.body;
  Blok.create(nama_blok, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({ message: 'Blok berhasil ditambahkan', id: result.insertId });
  });
};

// UPDATE blok
exports.update = (req, res) => {
  const { id } = req.params;
  const { nama_blok } = req.body;
  Blok.update(id, nama_blok, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Blok tidak ditemukan' });
    res.json({ message: 'Blok berhasil diupdate' });
  });
};

// DELETE blok
exports.delete = (req, res) => {
  const { id } = req.params;
  Blok.delete(id, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Blok tidak ditemukan' });
    res.json({ message: 'Blok berhasil dihapus' });
  });
};
