import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const dbConfig = {
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    encrypt: false,
    trustServerCertificate: true
  }
};

const tables = ['TaiKhoan', 'PhanAnh', 'ThongBao', 'HoGiaDinh', 'DonVi', 'CanBo', 'NhatKy'];
const backupDir = path.join(process.cwd(), 'database_backup_mssql');

async function backupDatabase() {
  try {
    console.log('Connecting to MSSQL...');
    const pool = await sql.connect(dbConfig);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    for (const table of tables) {
      console.log(`Backing up table: ${table}...`);
      const result = await pool.request().query(`SELECT * FROM ${table}`);
      
      const filePath = path.join(backupDir, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(result.recordset, null, 2), 'utf8');
      console.log(`Saved ${result.recordset.length} rows to ${filePath}`);
    }

    console.log('Backup completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Backup failed:', err);
    process.exit(1);
  }
}

backupDatabase();
