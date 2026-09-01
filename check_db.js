import db from './server/config/database.js';

async function run() {
  try {
    const pool = await db.getPool();
    const result = await pool.request().query('SELECT tai_khoan_id, ten_dang_nhap, mat_khau, ho_ten, vai_tro FROM TaiKhoan');
    console.log('--- DANH SÁCH TÀI KHOẢN TRONG DATABASE ---');
    console.log(result.recordset);
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi truy vấn table TaiKhoan:', err);
    process.exit(1);
  }
}

run();
