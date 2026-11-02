const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config(); // fallback
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Authority = require('../models/Authority');
const Report = require('../models/Report');
const Announcement = require('../models/Announcement');

/**
 * Seed municipal zones and initial clean demo accounts.
 * Clears all fake reports, placeholder stock photos, and test records.
 */
const seed = async () => {
  await connectDB();

  // Clear all collections to remove fake entries completely
  await Promise.all([
    User.deleteMany({}),
    Authority.deleteMany({}),
    Report.deleteMany({}),
    Announcement.deleteMany({}),
  ]);
  console.log('🧹 Removed all fake reports, stock photos, and placeholder data.');

  // 1. Municipal Authority Zones (Palghar / Mumbai Region for Mumbai University Mini Project)
  const zones = [
    {
      name: 'Palghar Municipal Council - Zone West',
      department: 'Roads',
      boundary: {
        type: 'Polygon',
        coordinates: [[
          [72.50, 19.40],
          [73.20, 19.40],
          [73.20, 20.20],
          [72.50, 20.20],
          [72.50, 19.40],
        ]],
      },
    },
    {
      name: 'Palghar Municipal Council - Zone Central',
      department: 'Water',
      boundary: {
        type: 'Polygon',
        coordinates: [[
          [72.60, 19.50],
          [73.00, 19.50],
          [73.00, 20.00],
          [72.60, 20.00],
          [72.60, 19.50],
        ]],
      },
    },
    {
      name: 'Mumbai Metropolitan Authority - Public Works',
      department: 'Sanitation',
      boundary: {
        type: 'Polygon',
        coordinates: [[
          [72.70, 18.80],
          [73.20, 18.80],
          [73.20, 19.40],
          [72.70, 19.40],
          [72.70, 18.80],
        ]],
      },
    },
    {
      name: 'Mumbai Metropolitan Authority - Zone North',
      department: 'Electrical',
      boundary: {
        type: 'Polygon',
        coordinates: [[
          [72.80, 19.10],
          [73.10, 19.10],
          [73.10, 19.40],
          [72.80, 19.40],
          [72.80, 19.10],
        ]],
      },
    },
    // Bangalore demo zones
    {
      name: 'Zone West (Demo)',
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
  ];

  const createdZones = await Authority.insertMany(zones);
  console.log(`✅ Created ${createdZones.length} municipal authority zones.`);

  // 2. Central Municipal Administrator (oversees all departments and zones)
  await User.create({
    name: 'Municipal Administrator',
    email: 'admin@civic.com',
    password: 'admin123',
    role: 'admin',
    authorityId: null,
  });

  // 3. Demo Citizen User
  await User.create({
    name: 'Citizen User',
    email: 'citizen@civic.com',
    password: 'citizen123',
    role: 'citizen',
    points: 50,
    badges: ['first_reporter'],
  });

  // 4. Welcome Announcement
  await Announcement.create({
    title: 'Civic Maintenance Platform Online',
    content:
      'Welcome to Reality Check. Citizens can report infrastructure issues with photos and GPS. Municipal authorities will review and resolve tickets promptly.',
    priority: 'normal',
    createdBy: (await User.findOne({ email: 'admin@civic.com' }))._id,
  });

  console.log('✅ Clean demo accounts ready:');
  console.log('   * Municipal Admin: admin@civic.com   / admin123');
  console.log('   * Citizen Account: citizen@civic.com / citizen123');
  console.log('✨ Clean database ready! No fake reports.');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});
