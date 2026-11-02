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

const connectDB = require('../config/db');
const Report = require('../models/Report');
const User = require('../models/User');

const cleanFakeReports = async () => {
  try {
    await connectDB();
    console.log('🔍 Scanning database for fake/stock placeholder reports...');

    // Matches the dummy entries from previous seed (Olympia typewriter, stock pothole, etc.)
    const fakeFilter = {
      $or: [
        { description: /Major drinking water pipeline breach/i },
        { description: /Deep hazardous pothole near 8th Cross/i },
        { description: /Olympia/i },
        { description: /Malleshwaram/i },
        { description: /Rajajinagar/i },
        { address: /Rajajinagar/i },
        { address: /Malleshwaram/i },
        { photoUrl: /unsplash\.com/i },
        { photoUrl: /placeholder/i },
      ],
    };

    const count = await Report.countDocuments(fakeFilter);
    const result = await Report.deleteMany(fakeFilter);

    // Also remove dummy citizen user "Sneha Patil" if present
    await User.deleteMany({ email: 'sneha@example.com' });
    await User.deleteMany({ name: 'Sneha Patil' });

    console.log('\n================================================================');
    console.log(`✅ SUCCESS: Removed ${result.deletedCount} fake/stock report(s).`);
    console.log(`🧹 Removed dummy account (Sneha Patil).`);
    console.log(`✨ All real reports submitted by you remain safe and intact!`);
    console.log('================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error cleaning fake reports:', err.message);
    process.exit(1);
  }
};

cleanFakeReports();
