const User = require('../models/User');
const Report = require('../models/Report');
const { refreshUserBadges, BADGE_RULES } = require('../services/gamificationService');

exports.getMyStats = async (req, res) => {
  const data = await refreshUserBadges(req.user._id);

  const reports = await Report.find({ reporterId: req.user._id })
    .sort('-createdAt')
    .limit(5);

  res.json({
    success: true,
    points: data.points,
    badges: data.badges,
    stats: data.stats,
    allBadges: BADGE_RULES.map((b) => ({ id: b.id, label: b.label })),
    recentReports: reports,
  });
};

exports.getLeaderboard = async (req, res) => {
  const users = await User.find({ role: 'citizen' })
    .sort('-points')
    .limit(10)
    .select('name points badges');

  res.json({ success: true, leaderboard: users });
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('name points badges createdAt');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};