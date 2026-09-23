const Announcement = require('../models/Announcement');

exports.createAnnouncement = async (req, res) => {
  const { title, body, priority, authorityId, expiresAt } = req.body;
  if (!title || !body)
    return res.status(400).json({ success: false, message: 'Title and body required' });

  const ann = await Announcement.create({
    title,
    body,
    priority: priority || 'normal',
    authorityId: authorityId || null,
    createdBy: req.user._id,
    expiresAt: expiresAt || null,
  });

  const io = req.app.get('io');
  io.emit('announcement:new', ann);

  res.status(201).json({ success: true, announcement: ann });
};

exports.getAnnouncements = async (req, res) => {
  const now = new Date();
  const announcements = await Announcement.find({
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  })
    .populate('createdBy', 'name')
    .populate('authorityId', 'name')
    .sort('-createdAt')
    .limit(50);

  res.json({ success: true, count: announcements.length, announcements });
};

exports.deleteAnnouncement = async (req, res) => {
  const ann = await Announcement.findByIdAndDelete(req.params.id);
  if (!ann) return res.status(404).json({ success: false, message: 'Not found' });

  const io = req.app.get('io');
  io.emit('announcement:deleted', { id: req.params.id });

  res.json({ success: true });
};