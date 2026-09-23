const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createAuthority,
  getAllAuthorities,
  locateAuthority,
} = require('../controllers/authorityController');

router.post('/', protect, authorize('admin'), createAuthority);
router.get('/', protect, getAllAuthorities);
router.get('/locate', protect, locateAuthority);

module.exports = router;