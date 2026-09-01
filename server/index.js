import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

// Khởi tạo database (import để chạy init)
import './config/database.js';

// Import WebSocket
import initWebSocket from './config/websocket.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import reportRoutes from './routes/report.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import hoGiaDinhRoutes from './routes/hogiadinh.routes.js';

// Import middleware
import errorHandler from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Khởi tạo bộ nhớ tạm để lưu OTP
global.otpStore = {};

// Middleware chung
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Đăng ký routes
app.use(authRoutes);
app.use(reportRoutes);
app.use(announcementRoutes);
app.use(hoGiaDinhRoutes);

// Middleware xử lý lỗi tập trung (phải đặt sau tất cả routes)
app.use(errorHandler);

// Tạo HTTP server và attach WebSocket
const httpServer = createServer(app);
initWebSocket(httpServer);

// Khởi động server
httpServer.listen(PORT, () => {
  console.log(`Server API đang chạy tại http://localhost:${PORT}`);
  console.log(`WebSocket đang lắng nghe tại ws://localhost:${PORT}`);
});
