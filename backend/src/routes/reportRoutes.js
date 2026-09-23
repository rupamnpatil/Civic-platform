const router = require('express').Router();
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const {
  createReport,
  getNearbyReports,
  getFeed,
  getMyReports,
  getAllReports,
  updateStatus,
  upvoteReport,
  getReportById,
  deleteReport, // ✅ Import the new function
} = require('../controllers/reportController');

router.post('/', protect, upload.single('photo'), createReport);
router.get('/nearby', protect, getNearbyReports);
router.get('/feed', protect, getFeed);
router.get('/my', protect, getMyReports);
router.get('/', protect, authorize('admin'), getAllReports);
router.get('/:id', protect, getReportById);
router.patch('/:id/status', protect, authorize('admin'), updateStatus);
router.post('/:id/upvote', protect, upvoteReport);
router.delete('/:id', protect, authorize('admin'), deleteReport); // ✅ New route

module.exports = router;