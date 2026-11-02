const dns = require('dns');
const mongoose = require('mongoose');

// Configure IPv4 first and public DNS to resolve Atlas SRV records reliably on Windows
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if not supported in environment
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB error: ${err.message}`);
    if (err.message.includes('querySrv') || err.message.includes('ENOTFOUND')) {
      console.error('\n================================================================');
      console.error('📌 HOW TO FIX THIS MONGODB ATLAS ERROR:');
      console.error('================================================================');
      console.error('1. Check if your MongoDB Atlas cluster is PAUSED:');
      console.error('   Log in to https://cloud.mongodb.com');
      console.error('   Free-tier (M0) clusters pause after 60 days of inactivity.');
      console.error('   If paused, click "Resume" on your cluster.');
      console.error('2. Check Network Access in Atlas:');
      console.error('   Go to "Network Access" in the left sidebar.');
      console.error('   Ensure IP Address "0.0.0.0/0" (Allow from Anywhere) is active.');
      console.error('3. If you have a new cluster or connection string:');
      console.error('   Open backend/.env and update the MONGO_URI value.');
      console.error('================================================================\n');
    }
    throw err;
  }
};

module.exports = connectDB;
