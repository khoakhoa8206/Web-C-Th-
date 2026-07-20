const express = require('express');
const router = express.Router();
const { getClasses, getSessions, getLeaderboard } = require('../controllers/leaderboardController');

// Toàn bộ route leaderboard là PUBLIC — không cần đăng nhập.
router.get('/classes', getClasses);
router.get('/sessions', getSessions);
router.get('/', getLeaderboard);

module.exports = router;
