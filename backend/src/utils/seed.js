require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Authority = require('../models/Authority');
const Report = require('../models/Report');

/**
 * Seed Bangalore-area zones (three side-by-side rectangles) + demo users.
 * Coordinates: [lng, lat]
 */
const seed = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Authority.deleteMany({}), Report.deleteMany({})]);
  console.log('🧹 Cleared collections');

  const zones = [
    {
      name: 'Zone West',
      department: 'Roads',
      boundary: {
        type: 'Polygon',
        coordinates: [[
          [77.50, 12.90],
          [77.58, 12.90],
          [77.58, 13.05],
          [77.50, 13.05],
          [77.50, 12.90],
        ]],
      },
    },
    {
      name: 'Zone Central',
      department: 'Electrical',
      boundary: {
        type: 'Polygon',
        coordinates: [[
          [77.58, 12.90],
          [77.65, 12.90],
          [77.65, 13.05],
          [77.58, 13.05],
          [77.58, 12.90],
        ]],
      },
    },
    {
      name: 'Zone East',
      department: 'Sanitation',
      boundary: {
        type: 'Polygon',
        coordinates: [[
          [77.65, 12.90],
          [77.72, 12.90],
          [77.72, 13.05],
          [77.65, 13.05],
          [77.65, 12.90],
        ]],
      },
    },
  ];

  const created = await Authority.insertMany(zones);
  console.log(`✅ Created ${created.length} zones`);

  const admin = await User.create({
    name: 'Roads Admin',
    email: 'admin@civic.com',
    password: 'admin123',
    role: 'admin',
    authorityId: created[0]._id, // Zone West — Roads
  });

  await User.create({
    name: 'Citizen One',
    email: 'citizen@civic.com',
    password: 'citizen123',
    role: 'citizen',
  });

  console.log('✅ Users created:');
  console.log('   admin@civic.com / admin123 (Zone West)');
  console.log('   citizen@civic.com / citizen123');
  console.log('🎉 Seeding complete');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});