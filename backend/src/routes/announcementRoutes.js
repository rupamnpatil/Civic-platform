const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} = require('../controllers/announcementController');

router.post('/', protect, authorize('admin'), createAnnouncement);
router.get('/', protect, getAnnouncements);
router.delete('/:id', protect, authorize('admin'), deleteAnnouncement);

module.exports = router;