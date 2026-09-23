const Authority = require('../models/Authority');

/**
 * Find the municipal authority whose boundary contains the given point.
 * Uses MongoDB $geoIntersects.
 */
exports.findAuthorityForLocation = async (lng, lat) => {
  const point = { type: 'Point', coordinates: [lng, lat] };
  const authority = await Authority.findOne({
    boundary: { $geoIntersects: { $geometry: point } },
  });
  return authority;
};

/**
 * Check for a duplicate report of the same category within `radiusMeters`.
 */
exports.findDuplicateReport = async (Report, lng, lat, category, radiusMeters = 15) => {
  return Report.findOne({
    category,
    status: { $in: ['submitted', 'assigned', 'in_progress'] },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusMeters,
      },
    },
  });
};