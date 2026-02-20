const User = require("../models/profileModel");

exports.getProfile = (req, res) => {
  const userId = req.user.id;

  User.getProfileById(userId, (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Gagal mengambil profile" });
    }

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(user);
  });
};

exports.updateProfile = (req, res) => {
  const userId = req.user.id;
  const { name, alamat, notelp } = req.body;

  User.updateProfile(userId, { name, alamat, notelp }, (err) => {
    if (err) {
      return res.status(500).json({ message: "Gagal update profile" });
    }

    User.getProfileById(userId, (err2, user) => {
      if (err2) {
        return res.status(500).json({ message: "Gagal mengambil data terbaru" });
      }

      res.json({
        message: "Profile berhasil diperbarui",
        user,
      });
    });
  });
};