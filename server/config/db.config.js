import sql from 'mssql/msnodesqlv8.js';
import 'dotenv/config'; // Tự động load các biến từ file .env

// Khởi tạo đối tượng cấu hình đọc từ process.env
const dbConfig = {
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  driver: 'msnodesqlv8',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    trustedConnection: true,
    encrypt: false, // Chọn 'true' nếu database của bạn ở trên các đám mây (như Azure)
    trustServerCertificate: true // Rất quan trọng khi chạy ở localhost (Dev env) để tránh lỗi chứng chỉ
  }
};

/**
 * Hàm thiết lập Connection Pool kết nối đến MS SQL Server
 */
const connectDB = async () => {
  try {
    // Thử kết nối
    const pool = await sql.connect(dbConfig);
    console.log('✅ KẾT NỐI THÀNH CÔNG ĐẾN MS SQL SERVER!');
    return pool;
  } catch (error) {
    // Nếu thất bại
    console.error('❌ KẾT NỐI THẤT BẠI ĐẾN MS SQL SERVER!');
    console.error('Chi tiết lỗi:', error.message);
    
    // Dừng chương trình (tùy chọn - vì nếu không có DB thì Backend cũng vô dụng)
    process.exit(1); 
  }
};

// Xuất cả đối tượng sql (để cấu hình parameters) và hàm connectDB
export { sql, connectDB };
