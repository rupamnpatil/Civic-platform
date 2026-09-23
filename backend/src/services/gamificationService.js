const User = require('../models/User');
const Report = require('../models/Report');

const BADGE_RULES = [
  { id: 'first_reporter', label: '🥇 First Reporter', check: (s) => s.reportCount >= 1 },
  { id: 'reporter', label: '🥈 Reporter', check: (s) => s.reportCount >= 5 },
  { id: 'civic_hero', label: '🥉 Civic Hero', check: (s) => s.reportCount >= 20 },
  { id: 'community_voice', label: '📣 Community Voice', check: (s) => s.totalUpvotes >= 10 },
  { id: 'trending', label: '🔥 Trending', check: (s) => s.maxUpvotes >= 20 },
  { id: 'verified', label: '✅ Verified', check: (s) => s.resolvedCount >= 1 },
];

/**
 * Recompute a user's stats + badges.
 */
async function refreshUserBadges(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const reports = await Report.find({ reporterId: userId });

  const reportCount = reports.length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const totalUpvotes = reports.reduce((sum, r) => sum + (r.upvotes?.length || 0), 0);
  const maxUpvotes = reports.reduce(
    (max, r) => Math.max(max, r.upvotes?.length || 0),
    0
  );

  const stats = { reportCount, resolvedCount, totalUpvotes, maxUpvotes };

  const earned = BADGE_RULES.filter((b) => b.check(stats)).map((b) => b.id);
  const newBadges = earned.filter((b) => !user.badges.includes(b));

  if (newBadges.length > 0) {
    user.badges = [...new Set([...user.badges, ...newBadges])];
    await user.save();
  }

  return {
    points: user.points,
    badges: user.badges,
    stats,
  };
}

/**
 * Award points to a user. Idempotency is the caller's responsibility.
 */
async function awardPoints(userId, amount) {
  if (!userId || !amount) return;
  await User.findByIdAndUpdate(userId, { $inc: { points: amount } });
}

module.exports = { refreshUserBadges, awardPoints, BADGE_RULES };