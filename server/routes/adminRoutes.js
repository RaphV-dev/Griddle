const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { verifyAdmin } = require('../middlewares/adminMiddleware');
const adminController = require('../controllers/adminController');

router.use(verifyToken, verifyAdmin);

router.get('/dashboard', adminController.getAdminDashboard);
router.delete('/users/:id', adminController.deleteUser);
router.delete('/users/:id/daily-try', adminController.deleteUserDailyTry);

module.exports = router;