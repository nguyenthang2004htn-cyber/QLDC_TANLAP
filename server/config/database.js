import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Lỗi: Thiếu SUPABASE_URL hoặc SUPABASE_KEY trong file .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Đã khởi tạo kết nối Supabase thành công');

export default supabase;
