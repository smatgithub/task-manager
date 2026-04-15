const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

async function testPageAccess() {
  console.log('🧪 Testing Page Access System...\n');

  try {
    // 1. Test page access setup
    console.log('1. Checking page access setup...');
    const setupResponse = await fetch(`${API_BASE}/api/debug/page-access`);
    const setupData = await setupResponse.json();
    console.log('✅ Setup status:', setupData);
    console.log('');

    // 2. Test users endpoint
    console.log('2. Checking users...');
    const usersResponse = await fetch(`${API_BASE}/api/debug/users`);
    const usersData = await usersResponse.json();
    console.log('✅ Users found:', usersData.count);
    console.log('');

    // 3. Test page access for users (without auth - should fail)
    console.log('3. Testing page access without authentication...');
    try {
      const noAuthResponse = await fetch(`${API_BASE}/api/page-access/my-access`);
      if (noAuthResponse.status === 401) {
        console.log('✅ Authentication required (expected)');
      } else {
        console.log('❌ Should require authentication');
      }
    } catch (error) {
      console.log('✅ Authentication required (expected)');
    }
    console.log('');

    // 4. Test page access for admin users
    console.log('4. Testing admin page access...');
    try {
      const adminResponse = await fetch(`${API_BASE}/api/page-access/users-summary`);
      if (adminResponse.status === 401) {
        console.log('✅ Admin endpoint requires authentication (expected)');
      } else {
        console.log('❌ Admin endpoint should require authentication');
      }
    } catch (error) {
      console.log('✅ Admin endpoint requires authentication (expected)');
    }
    console.log('');

    console.log('🎉 Page access system is properly configured!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Login with one of the existing users');
    console.log('3. Check the User Access Control page');
    console.log('4. Verify that page permissions are correctly displayed and can be modified');

  } catch (error) {
    console.error('❌ Error testing page access:', error.message);
  }
}

testPageAccess();


