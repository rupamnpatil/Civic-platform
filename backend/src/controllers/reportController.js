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

  // 1. Proximity-based duplicate check within 15 meters
  const duplicate = await findDuplicateReport(Report, lngNum, latNum, category, 15);

  if (duplicate) {
    // Merge into existing report as an upvote (avoids redundant image upload to Cloudinary)
    const hasUpvoted = duplicate.upvotes.some((u) => String(u) === String(req.user._id));
    if (!hasUpvoted) {
      duplicate.upvotes.push(req.user._id);
      await duplicate.save();
      // Award 5 points to the original reporter
      await awardPoints(duplicate.reporterId, 5);
      await refreshUserBadges(duplicate.reporterId);
    }

    const populatedDup = await Report.findById(duplicate._id)
      .populate('reporterId', 'name email badges points')
      .populate('authorityId', 'name department');

    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('report:updated', populatedDup || duplicate);
      io.emit('report:updated', populatedDup || duplicate);
      io.to(`user:${duplicate.reporterId}`).emit('report:updated', populatedDup || duplicate);
    }

    return res.status(200).json({
      success: true,
      merged: true,
      message: 'Similar report found — your upvote was added.',
      report: populatedDup || duplicate,
    });
  }

  // 2. Only upload image to Cloudinary if it's confirmed to be a new report
  let photoUrl = '';
  try {
    const uploaded = await uploadToCloudinary(req.file.buffer);
    photoUrl = uploaded.secure_url;
  } catch (cloudErr) {
    console.warn('⚠️ Cloudinary upload failed, using data URI fallback:', cloudErr.message);
    const mime = req.file.mimetype || 'image/jpeg';
    photoUrl = 'data:' + mime + ';base64,' + req.file.buffer.toString('base64');
  }

  // 3. Auto-route to municipal authority zone using GeoJSON point-in-polygon
  const authority = await findAuthorityForLocation(lngNum, latNum);

  const report = await Report.create({
    reporterId: req.user._id,
    category,
    description,
    photoUrl,
    location: { type: 'Point', coordinates: [lngNum, latNum] },
    address: address || '',
    authorityId: authority?._id || null,
    status: authority ? 'assigned' : 'submitted',
    priority: CATEGORY_PRIORITY[category] || 'medium',
    statusHistory: [
      {
        status: authority ? 'assigned' : 'submitted',
        changedBy: req.user._id,
        actor: req.user._id,
        note: authority
          ? `Auto-routed to ${authority.name} (${authority.department})`
          : 'Awaiting manual routing',
      },
    ],
  });

  // Award 10 points to reporter + refresh badges
  await awardPoints(req.user._id, 10);
  await refreshUserBadges(req.user._id);

  // Fetch fully populated report for real-time delivery
  const populatedReport = await Report.findById(report._id)
    .populate('reporterId', 'name email badges points')
    .populate('authorityId', 'name department');

  const io = req.app.get('io');
  if (io) {
    io.to('admins').emit('report:new', populatedReport || report);
    io.emit('report:new', populatedReport || report);
  }

  res.status(201).json({ success: true, report: populatedReport || report });
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

  let reports = await Report.find(filter)
    .populate('reporterId', 'name badges points')
    .populate('authorityId', 'name department')
    .sort({ createdAt: -1 })
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

  // Municipal admin dashboard sees ALL reports (including pending/unassigned)
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

  const previousStatus = report.status;
  report.status = status;
  report.statusHistory.push({
    status,
    changedBy: req.user._id,
    actor: req.user._id,
    note: note || '',
  });
  await report.save();

  // Award 20 points when transitioning to resolved (only once)
  if (status === 'resolved' && previousStatus !== 'resolved') {
    await awardPoints(report.reporterId, 20);
    await refreshUserBadges(report.reporterId);
  }

  const updatedReport = await Report.findById(report._id)
    .populate('reporterId', 'name email badges points')
    .populate('authorityId', 'name department')
    .populate('statusHistory.changedBy', 'name role')
    .populate('statusHistory.actor', 'name role');

  const io = req.app.get('io');
  if (io) {
    io.to(`user:${report.reporterId}`).emit('report:updated', updatedReport || report);
    io.to('admins').emit('report:updated', updatedReport || report);
    io.emit('report:updated', updatedReport || report);
  }

  res.json({ success: true, report: updatedReport || report });
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
    // Award 5 points to original reporter
    await awardPoints(report.reporterId, 5);
    await refreshUserBadges(report.reporterId);

    const populated = await Report.findById(report._id)
      .populate('reporterId', 'name email badges points')
      .populate('authorityId', 'name department');

    // Broadcast upvote update to all clients
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('report:updated', populated || report);
      io.emit('report:updated', populated || report);
      io.to(`user:${report.reporterId}`).emit('report:updated', populated || report);
    }
  }

  res.json({
    success: true,
    upvotes: report.upvotes.length,
    alreadyUpvoted,
  });
};

exports.getReportById = async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('reporterId', 'name email badges points')
    .populate('authorityId', 'name department')
    .populate('statusHistory.changedBy', 'name role')
    .populate('statusHistory.actor', 'name role');
  if (!report) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, report });
};

exports.deleteReport = async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  await report.deleteOne();

  // Notify all connected clients (mobile + admin) to remove this report
  const io = req.app.get('io');
  if (io) {
    io.emit('report:deleted', { id: req.params.id });
  }

  res.json({ success: true, message: 'Report deleted successfully' });
};
