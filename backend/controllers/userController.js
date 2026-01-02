const User = require('../models/userModel');

// Admin - ambil semua user
exports.getUsers = (req, res) => {
  User.getAll((err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
};

// Admin - detail user
exports.getUserById = (req, res) => {
  User.getById(req.params.id, (err, user) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(user);
  });
};

// Admin - update user
exports.updateUser = (req, res) => {
  User.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'User berhasil diperbarui' });
  });
};

// Admin - hapus user (opsional)
exports.deleteUser = (req, res) => {
  User.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'User berhasil dihapus' });
  });
};
