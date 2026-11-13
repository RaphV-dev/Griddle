const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const {verifyToken, optionalAuth} = require('../middlewares/authMiddleware')

router.get('/drivers', gameController.getAllDrivers);
router.get('/today', optionalAuth, gameController.getTodayChallenge);

router.post('/guess', verifyToken, gameController.validateGuess);
router.post('/submit', verifyToken, gameController.submitDailyResults);

module.exports = router;