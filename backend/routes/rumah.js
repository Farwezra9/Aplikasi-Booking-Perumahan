const express = require('express');
const router = express.Router();
const rumahController = require('../controllers/rumahController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require("../middleware/rumah");

router.get('/available', rumahController.getAvailable);
router.get('/', verifyToken, rumahController.getRumah);
router.get('/filter', verifyToken, rumahController.filterRumah);
router.get('/:id', verifyToken, rumahController.getRumahById);
router.post('/', verifyToken, isAdmin, upload.single("gambar"), rumahController.createRumah);
router.put('/:id', verifyToken, isAdmin, upload.single("gambar"), rumahController.updateRumah);
router.delete('/:id', verifyToken, isAdmin, rumahController.deleteRumah);

module.exports = router;
