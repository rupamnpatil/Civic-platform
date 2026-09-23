const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, required: true, maxlength: 1000 },
    priority: {
      type: String,
      enum: ['normal', 'important', 'urgent'],
      default: 'normal',
    },
    authorityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Authority',
      default: null, // null = city-wide
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);