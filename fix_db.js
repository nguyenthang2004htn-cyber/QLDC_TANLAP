import sql from 'mssql/msnodesqlv8.js';
import db from './server/config/database.js';

async function fixUniquePhone() {
  try {
    const pool = await db.getPool();
    // Find the constraint name for 'dien_thoai' in 'TaiKhoan'
    const result = await pool.request().query(`
      SELECT tc.CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
      JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu 
        ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
      WHERE tc.TABLE_NAME = 'TaiKhoan' 
        AND ccu.COLUMN_NAME = 'dien_thoai' 
        AND tc.CONSTRAINT_TYPE = 'UNIQUE'
    `);
    
    if (result.recordset.length > 0) {
      const constraintName = result.recordset[0].CONSTRAINT_NAME;
      console.log('Found constraint:', constraintName);
      await pool.request().query(`ALTER TABLE TaiKhoan DROP CONSTRAINT ${constraintName}`);
      console.log('Dropped unique constraint successfully.');
    } else {
      console.log('No unique constraint found on dien_thoai.');
    }
  } catch (err) {
    console.error('Error fixing constraint:', err);
  } finally {
    process.exit();
  }
}

fixUniquePhone();
