import TaiKhoan from './server/models/TaiKhoan.model.js';

async function testLogin() {
  try {
    console.log('Testing findByCredentials...');
    const user1 = await TaiKhoan.findByCredentials('dancu', '123');
    console.log('User dancu:', user1);

    const user2 = await TaiKhoan.findByCredentials('canbo', '123');
    console.log('User canbo:', user2);

    const user3 = await TaiKhoan.findByCredentials('chutich', '123');
    console.log('User chutich:', user3);

    const user4 = await TaiKhoan.findByCredentials('it_admin', '123');
    console.log('User it_admin:', user4);

    process.exit(0);
  } catch (err) {
    console.error('Error during testLogin:', err);
    process.exit(1);
  }
}

testLogin();
