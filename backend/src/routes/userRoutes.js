const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getMyStats,
  getLeaderboard,
  getUserById,
} = require('../controllers/userController');

router.get('/me/stats', protect, getMyStats);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/:id', protect, getUserById);

module.exports = router;