import sql from 'mssql';
import 'dotenv/config';

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  options: { encrypt: false, trustServerCertificate: true }
};

async function test() {
  try {
    await sql.connect(dbConfig);
    console.log("SUCCESS!");
  } catch(e) {
    console.error("FAIL:", e);
  }
  process.exit();
}
test();
