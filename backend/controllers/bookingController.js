const Booking = require('../models/bookingModel');

// User membuat booking
exports.createBooking = (req, res) => {
  const user_id = req.user.id;
  const { rumah_id, tanggal_kunjungan, kontak, catatan } = req.body;

  Booking.checkDuplicateBooking(user_id, rumah_id, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.length > 0) {
      return res.status(400).json({
        message: 'Anda sudah pernah membooking rumah ini',
      });
    }

    Booking.create(
      { rumah_id, user_id, tanggal_kunjungan, kontak, catatan },
      (err2) => {
        if (err2) return res.status(500).json({ message: err2.message });

        res.json({
          message:
            'Booking berhasil dibuat dan masuk waiting list. Tunggu konfirmasi admin.',
        });
      }
    );
  });
};

// Admin lihat semua booking
exports.getAllBookings = (req, res) => {
  Booking.getAll((err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
};

// Admin update status booking
exports.updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  Booking.updateStatus(id, status, (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Status booking dan rumah berhasil diperbarui' });
  });
};

// User lihat booking miliknya
exports.getUserBookings = (req, res) => {
  const user_id = req.user.id;
  Booking.getByUser(user_id, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
};
exports.updateBookingStatusUser = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const { status } = req.body;

  Booking.updateStatusUser(id, user_id, status, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    res.json({ message: 'Status booking berhasil diperbarui' });
  });
};
