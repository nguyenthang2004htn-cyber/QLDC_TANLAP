import sql from 'mssql/msnodesqlv8.js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Cấu hình kết nối SQL Server từ file .env
// Nếu chưa có, sẽ log lỗi hướng dẫn cấu hình
const dbConfig = {
  database: process.env.DB_NAME || 'QuanLyDanCu',
  server: process.env.DB_SERVER || 'localhost',
  driver: 'msnodesqlv8',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    trustedConnection: true,
    encrypt: false, // Dùng true nếu deploy lên Azure
    trustServerCertificate: true // Trust cho kết nối local
  }
};

const initSqlPath = path.join(process.cwd(), 'server', 'db', 'init.sql');

class DatabaseWrapper {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      if (!this.pool) {
        this.pool = await sql.connect(dbConfig);
        console.log('Kết nối thành công đến Microsoft SQL Server');
        
        await this.initializeDatabase();
      }
      return this.pool;
    } catch (err) {
      console.error('Lỗi khi kết nối đến SQL Server. Vui lòng kiểm tra thông tin đăng nhập trong file .env. Chi tiết lỗi:', err);
      // Không throw error để server Express vẫn có thể khởi động (dù API có thể báo lỗi sau đó)
    }
  }

  async initializeDatabase() {
    console.log('Bỏ qua khởi tạo vì Database đã được seed thủ công thông qua QuanLyDanCu.sql');
  }

  async getPool() {
    if (!this.pool) {
      await this.connect();
    }
    return this.pool;
  }
}

// Khởi tạo một instance lưu giữ kết nối (Singleton pattern)
const db = new DatabaseWrapper();

// Khởi tạo kết nối ngay khi file được import
db.connect();

export default db;
