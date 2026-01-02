const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/chart', verifyToken, isAdmin, dashboardController.getperum);
router.get('/statistics', verifyToken, isAdmin, dashboardController.getStats);
router.get('/latest', verifyToken, isAdmin, dashboardController.getlat);

module.exports = router;
