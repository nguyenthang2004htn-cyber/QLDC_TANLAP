import sql from 'mssql/msnodesqlv8.js';
import 'dotenv/config';
import db from './server/config/database.js';

async function update() {
  try {
    let pool = await db.getPool();
    console.log("CONNECT SUCCESS");
    await pool.request().query("ALTER TABLE HoGiaDinh ADD nam_sinh INT;");
    console.log("ALTER SUCCESS");
  } catch(e) {
    if (e.message && e.message.includes('already has')) {
        console.log("ALREADY EXISTS");
    } else {
        console.error("FAIL:", e);
    }
  }
  process.exit();
}
update();
