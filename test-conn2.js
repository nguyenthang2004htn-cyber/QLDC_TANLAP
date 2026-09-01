import sql from 'mssql/msnodesqlv8.js';
import 'dotenv/config';

const dbConfig = {
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};

async function test() {
  try {
    await sql.connect(dbConfig);
    console.log("SUCCESS WITH MSNODESQLV8!");
  } catch(e) {
    console.error("FAIL:", e);
  }
  process.exit();
}
test();
