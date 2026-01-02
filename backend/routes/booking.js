const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, bookingController.createBooking); // user booking
router.put('/bookingStatusUser/:id', verifyToken, bookingController.updateBookingStatusUser);
router.get('/user', verifyToken, bookingController.getUserBookings); // user lihat booking
router.get('/', verifyToken, isAdmin, bookingController.getAllBookings); // admin lihat semua
router.put('/:id', verifyToken, isAdmin, bookingController.updateBookingStatus); // admin update status

module.exports = router;
