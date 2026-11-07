const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/drivers', gameController.getAllDrivers);
router.get('/today', authMiddleware.optionalAuth, gameController.getTodayChallenge);

router.post('/guess', authMiddleware.verifyToken, gameController.validateGuess);
router.post('/submit', authMiddleware.verifyToken, gameController.submitDetailyResults);

module.exports = router;