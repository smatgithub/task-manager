const mongoose = require('mongoose');
require('dotenv').config();

// Load local development configuration if in development mode
if (process.env.NODE_ENV === 'development' && !process.env.MONGO_URI) {
  const localConfig = require('./ServerConnect/config.local.js');
  Object.keys(localConfig).forEach((key) => {
    if (!process.env[key]) {
      process.env[key] = localConfig[key];
    }
  });
}

const User = require('./ServerConnect/models/User');

async function promoteUserToAdmin() {
  const empIdRaw = process.argv[2];
  const empId = Number(empIdRaw);

  if (!Number.isFinite(empId)) {
    console.error('Usage: node promote-user-to-admin.js <empId>');
    process.exitCode = 2;
    return;
  }

  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI. Set it in your environment or .env file.');
    process.exitCode = 2;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ empId });
    if (!user) {
      console.error(`❌ No user found with empId=${empId}`);
      process.exitCode = 1;
      return;
    }

    const previousRole = user.role;
    user.role = 'admin';
    await user.save();

    console.log('✅ User promoted to admin');
    console.log('🆔 empId:', user.empId);
    console.log('📧 email:', user.email);
    console.log('👤 role:', `${previousRole} -> ${user.role}`);
  } catch (err) {
    console.error('❌ Failed to promote user:', err);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.connection.close();
    } catch {
      // ignore
    }
  }
}

promoteUserToAdmin();

