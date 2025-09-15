const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Load local development configuration if in development mode
if (process.env.NODE_ENV === 'development' && !process.env.MONGO_URI) {
  const localConfig = require('./ServerConnect/config.local.js');
  Object.keys(localConfig).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = localConfig[key];
    }
  });
}

const User = require('./ServerConnect/models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users (for testing)
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Existing users cleared');

    // Create admin user
    const adminData = {
      name: 'System Administrator',
      email: 'admin@eflow.com',
      password: await bcrypt.hash('admin123', 10),
      empId: 1001,
      role: 'admin',
      department: 'IT Administration',
      authProvider: 'local'
    };

    const admin = new User(adminData);
    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('🆔 Employee ID: 1001');

    // Create a regular user for testing
    const userData = {
      name: 'Test User',
      email: 'user@eflow.com',
      password: await bcrypt.hash('user123', 10),
      empId: 2001,
      role: 'user',
      department: 'Operations',
      authProvider: 'local'
    };

    const user = new User(userData);
    await user.save();
    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', userData.email);
    console.log('🔑 Password: user123');
    console.log('👤 Role: user');
    console.log('🆔 Employee ID: 2001');

    // Create a HOD user for testing
    const hodData = {
      name: 'Head of Department',
      email: 'hod@eflow.com',
      password: await bcrypt.hash('hod123', 10),
      empId: 3001,
      role: 'hod',
      department: 'Management',
      authProvider: 'local'
    };

    const hod = new User(hodData);
    await hod.save();
    console.log('✅ HOD user created successfully!');
    console.log('📧 Email:', hodData.email);
    console.log('🔑 Password: hod123');
    console.log('👤 Role: hod');
    console.log('🆔 Employee ID: 3001');

    console.log('\n🎉 All users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('┌─────────────────┬─────────────────┬──────────┬──────────┐');
    console.log('│ Email           │ Password        │ Role     │ EmpID    │');
    console.log('├─────────────────┼─────────────────┼──────────┼──────────┤');
    console.log('│ admin@eflow.com │ admin123        │ admin    │ 1001     │');
    console.log('│ hod@eflow.com   │ hod123          │ hod      │ 3001     │');
    console.log('│ user@eflow.com  │ user123         │ user     │ 2001     │');
    console.log('└─────────────────┴─────────────────┴──────────┴──────────┘');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createAdminUser();

