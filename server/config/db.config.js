import supabase from './database.js';

const connectDB = async () => {
  console.log('✅ Supabase Client đang được sử dụng (Database không cần connection pool như MSSQL)');
  return supabase;
};

// Cung cấp dummy object cho sql để tránh lỗi nếu còn sót file nào import
const sql = {};

export { sql, connectDB };
