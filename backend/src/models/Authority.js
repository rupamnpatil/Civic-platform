const mongoose = require('mongoose');

const authoritySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    department: {
      type: String,
      required: true,
      enum: ['Roads', 'Electrical', 'Sanitation', 'Water', 'General'],
    },
    boundary: {
      type: { type: String, enum: ['Polygon'], default: 'Polygon' },
      coordinates: { type: [[[Number]]], required: true }, // [[[lng,lat],...]]
    },
  },
  { timestamps: true }
);

authoritySchema.index({ boundary: '2dsphere' });

module.exports = mongoose.model('Authority', authoritySchema);