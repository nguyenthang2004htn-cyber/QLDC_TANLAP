import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import 'dotenv/config'; 
import { connectDB } from './config/db.config.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Cài đặt Middleware cơ bản
app.use(cors());
app.use(express.json()); // Giúp server đọc được cục dữ liệu JSON gửi từ Frontend

// Bước 1: Khởi động kết nối Database
connectDB();

// Bước 2: Cấu hình tài liệu Swagger (API Docs)
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Quản Lý Dân Cư',
      version: '1.0.0',
      description: 'Tài liệu hướng dẫn sử dụng Backend API - Xây dựng với Node.js, Express, MSSQL và bảo mật bởi JWT.',
      contact: {
        name: 'Nhà phát triển (Bạn)'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`, // URL mặc định
      },
    ],
    components: {
      securitySchemes: {
        // Cấu hình khoá bảo mật JWT
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', 
        },
      },
    }
  },
  // Nơi Swagger sẽ quét để tìm các bình luận (comments) mô tả API
  apis: ['./server/routes/*.js', './server/app.js'], 
};

// Áp dụng middleware swagger-ui vào đường dẫn /api-docs
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Bước 3: Định nghĩa các API Routes 

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Kiểm tra tình trạng máy chủ (Health Check)
 *     description: API mở (không cần Authentication) dùng để xem Web Server có hoạt động không.
 *     responses:
 *       200:
 *         description: Máy chủ Backend gọi là bắt máy!
 */
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: '🚀 Máy chủ Backend đang chạy mượt mà!',
    time: new Date()
  });
});

// Bước 4: Khởi động máy chủ lắng nghe tại Cổng được chỉ định
app.listen(PORT, () => {
  console.log(`\n=========================================`);
  console.log(`🛸 Máy chủ Web Server khởi chạy tại: http://localhost:${PORT}`);
  console.log(`📖 Xem Tài liệu API (Swagger) tại: http://localhost:${PORT}/api-docs`);
  console.log(`=========================================\n`);
});
