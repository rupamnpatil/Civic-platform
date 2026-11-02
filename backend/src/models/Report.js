const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'pothole',
        'streetlight',
        'sanitation',
        'water',
        'drainage',
        'tree',
        'traffic_signal',
        'stray_animals',
        'vandalism',
        'other',
      ],
    },
    description: { type: String, required: true, maxlength: 500 },
    photoUrl: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, default: '' },
    status: {
      type: String,
      enum: ['submitted', 'assigned', 'in_progress', 'resolved', 'rejected'],
      default: 'submitted',
    },
    authorityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Authority',
      default: null,
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

reportSchema.index({ location: '2dsphere' });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
