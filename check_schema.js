import db from './server/config/database.js';

async function inspectSchema() {
  try {
    const pool = await db.getPool();
    const result = await pool.request().query(`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `);
    
    const tables = {};
    for (const row of result.recordset) {
      if (!tables[row.TABLE_NAME]) tables[row.TABLE_NAME] = [];
      tables[row.TABLE_NAME].push(`${row.COLUMN_NAME} (${row.DATA_TYPE})`);
    }

    console.log('=== CẤU TRÚC DATABASE SQL SERVER HIỆN TẠI ===');
    console.log(JSON.stringify(tables, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi lấy thông tin schema:', err);
    process.exit(1);
  }
}

inspectSchema();
