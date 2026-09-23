const Authority = require('../models/Authority');

exports.createAuthority = async (req, res) => {
  const { name, department, coordinates } = req.body;
  if (!name || !department || !coordinates) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }
  const authority = await Authority.create({
    name,
    department,
    boundary: { type: 'Polygon', coordinates },
  });
  res.status(201).json({ success: true, authority });
};

exports.getAllAuthorities = async (req, res) => {
  const authorities = await Authority.find();
  res.json({ success: true, count: authorities.length, authorities });
};

/**
 * GET /api/authorities/locate?lng=&lat=
 * Returns which authority contains the given point.
 */
exports.locateAuthority = async (req, res) => {
  const { lng, lat } = req.query;
  if (!lng || !lat) {
    return res.status(400).json({ success: false, message: 'lng/lat required' });
  }
  const authority = await Authority.findOne({
    boundary: {
      $geoIntersects: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      },
    },
  });
  res.json({ success: true, authority });
};