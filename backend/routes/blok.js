const express = require('express');
const router = express.Router();
const blok = require('../controllers/blokController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, blok.getAll);
router.get('/:id', verifyToken, blok.getById);
router.post('/', verifyToken, isAdmin, blok.create);
router.put('/:id', verifyToken, isAdmin, blok.update);
router.delete('/:id', verifyToken, isAdmin, blok.delete);

module.exports = router;
