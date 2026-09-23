const Report = require('../models/Report');
const { uploadToCloudinary } = require('../config/cloudinary');
const {
  findAuthorityForLocation,
  findDuplicateReport,
} = require('../services/routingService');
const { awardPoints, refreshUserBadges } = require('../services/gamificationService');

const CATEGORY_PRIORITY = {
  pothole: 'high',
  water: 'high',
  drainage: 'high',
  traffic_signal: 'high',
  streetlight: 'medium',
  sanitation: 'medium',
  tree: 'medium',
  stray_animals: 'medium',
  vandalism: 'low',
  other: 'low',
};

exports.createReport = async (req, res) => {
  const { category, description, lng, lat, address } = req.body;

  if (!req.file) return res.status(400).json({ success: false, message: 'Photo is required' });
  if (!category || !description || !lng || !lat)
    return res.status(400).json({ success: false, message: 'Missing required fields' });

  const lngNum = parseFloat(lng);
  const latNum = parseFloat(lat);

  const duplicate = await findDuplicateReport(Report, lngNum, latNum, category, 15);

  const uploaded = await uploadToCloudinary(req.file.buffer);

  if (duplicate) {
    if (!duplicate.upvotes.some((u) => String(u) === String(req.user._id))) {
      duplicate.upvotes.push(req.user._id);
      await duplicate.save();
      // Award points to the original reporter
      await awardPoints(duplicate.reporterId, 5);
      await refreshUserBadges(duplicate.reporterId);
    }
    return res.status(200).json({
      success: true,
      merged: true,
      message: 'Similar report found — your upvote was added.',
      report: duplicate,
    });
  }

  const authority = await findAuthorityForLocation(lngNum, latNum);

  const report = await Report.create({
    reporterId: req.user._id,
    category,
    description,
    photoUrl: uploaded.secure_url,
    location: { type: 'Point', coordinates: [lngNum, latNum] },
    address: address || '',
    authorityId: authority?._id || null,
    status: authority ? 'assigned' : 'submitted',
    priority: CATEGORY_PRIORITY[category] || 'medium',
    statusHistory: [
      {
        status: authority ? 'assigned' : 'submitted',
        changedBy: req.user._id,
        note: authority
          ? `Auto-routed to ${authority.name}`
          : 'Awaiting manual routing',
      },
    ],
  });

  // Award points + refresh badges
  await awardPoints(req.user._id, 10);
  await refreshUserBadges(req.user._id);

  const io = req.app.get('io');
  io.to('admins').emit('report:new', report);

  res.status(201).json({ success: true, report });
};

exports.getNearbyReports = async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;
  if (!lat || !lng) return res.status(400).json({ success: false, message: 'lat/lng required' });

  const reports = await Report.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(radius),
      },
    },
  })
    .populate('reporterId', 'name')
    .limit(200);

  res.json({ success: true, count: reports.length, reports });
};

/**
 * Community feed — all recent reports from everyone.
 */
exports.getFeed = async (req, res) => {
  const { category, sort = 'recent', limit = 50 } = req.query;

  const filter = {};
  if (category) filter.category = category;

  let sortOption = { createdAt: -1 };
  if (sort === 'popular') {
    // We can't easily sort by upvotes.length in Mongo, so fetch + sort in memory
  }

  let reports = await Report.find(filter)
    .populate('reporterId', 'name badges points')
    .populate('authorityId', 'name department')
    .limit(parseInt(limit));

  if (sort === 'popular') {
    reports = reports.sort(
      (a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0)
    );
  }

  res.json({ success: true, count: reports.length, reports });
};

exports.getMyReports = async (req, res) => {
  const reports = await Report.find({ reporterId: req.user._id }).sort('-createdAt');
  res.json({ success: true, count: reports.length, reports });
};

exports.getAllReports = async (req, res) => {
  const { status, category, authorityId } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (authorityId) filter.authorityId = authorityId;

  if (req.user.role === 'admin' && req.user.authorityId) {
    filter.authorityId = req.user.authorityId;
  }

  const reports = await Report.find(filter)
    .populate('reporterId', 'name email')
    .populate('authorityId', 'name department')
    .sort('-createdAt')
    .limit(500);

  res.json({ success: true, count: reports.length, reports });
};

exports.updateStatus = async (req, res) => {
  const { status, note } = req.body;
  const allowed = ['assigned', 'in_progress', 'resolved', 'rejected'];
  if (!allowed.includes(status))
    return res.status(400).json({ success: false, message: 'Invalid status' });

  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

  if (
    req.user.role === 'admin' &&
    req.user.authorityId &&
    report.authorityId &&
    String(report.authorityId) !== String(req.user.authorityId)
  ) {
    return res.status(403).json({ success: false, message: 'Not your zone' });
  }

  const previousStatus = report.status;
  report.status = status;
  report.statusHistory.push({ status, changedBy: req.user._id, note: note || '' });
  await report.save();

  // Award points when transitioning to resolved (only once)
  if (status === 'resolved' && previousStatus !== 'resolved') {
    await awardPoints(report.reporterId, 20);
    await refreshUserBadges(report.reporterId);
  }

  const io = req.app.get('io');
  io.to(`user:${report.reporterId}`).emit('report:updated', report);
  io.to('admins').emit('report:updated', report);

  res.json({ success: true, report });
};

exports.upvoteReport = async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ success: false, message: 'Not found' });

  const alreadyUpvoted = report.upvotes.some(
    (u) => String(u) === String(req.user._id)
  );

  if (!alreadyUpvoted) {
    report.upvotes.push(req.user._id);
    await report.save();
    // Award points to original reporter
    await awardPoints(report.reporterId, 5);
    await refreshUserBadges(report.reporterId);
  }

  res.json({
    success: true,
    upvotes: report.upvotes.length,
    alreadyUpvoted,
  });
};

// ... (keep all your existing imports and functions above)

exports.getReportById = async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('reporterId', 'name email badges points')
    .populate('authorityId', 'name department')
    .populate('statusHistory.changedBy', 'name role');
  if (!report) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, report });
};

// ✅ ADD THIS NEW FUNCTION
exports.deleteReport = async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  // Admins can only delete reports in their own zone (if they have an authorityId)
  if (
    req.user.role === 'admin' &&
    req.user.authorityId &&
    report.authorityId &&
    String(report.authorityId) !== String(req.user.authorityId)
  ) {
    return res.status(403).json({ success: false, message: 'Not your zone' });
  }

  await report.deleteOne();

  // Notify all connected clients (mobile + admin) to remove this report
  const io = req.app.get('io');
  io.emit('report:deleted', { id: req.params.id });

  res.json({ success: true, message: 'Report deleted successfully' });
};