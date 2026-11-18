const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

router.get('/dashboard', verifyToken, userController.getDashboard);
router.put('/password', verifyToken, userController.changePassword);

module.exports = router;