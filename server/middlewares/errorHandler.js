/**
 * Middleware xử lý lỗi tập trung
 * Bắt tất cả lỗi từ controller và trả về JSON error response
 */
const errorHandler = (err, req, res, _next) => {
  console.error('Server Error:', err.stack || err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ';

  res.status(statusCode).json({ error: message });
};

export default errorHandler;
