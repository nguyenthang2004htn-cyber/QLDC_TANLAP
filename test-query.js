import sql from 'mssql/msnodesqlv8.js';
import 'dotenv/config';
import db from './server/config/database.js';

async function test() {
  try {
    let pool = await db.getPool();
    console.log("SUCCESS WITH CONNECT!");
    let res = await pool.request()
      .input('username', sql.VarChar, 'dancu')
      .input('password', sql.VarChar, '123')
      .query(`
        SELECT tai_khoan_id AS id, tai_khoan_id, ten_dang_nhap, dien_thoai, ho_ten, vai_tro, cho_thuong_tru, que_quan, nam_sinh, managed_area
        FROM TaiKhoan 
        WHERE (ten_dang_nhap = @username OR dien_thoai = @username) AND mat_khau = @password
      `);
    console.log("SUCCESS WITH QUERY!", res.recordset);
  } catch(e) {
    console.error("FAIL:", e);
  }
  process.exit();
}
test();
