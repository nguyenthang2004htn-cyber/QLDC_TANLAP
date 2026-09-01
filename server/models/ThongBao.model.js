import supabase from '../config/database.js';

const ThongBao = {
  /**
   * Lấy tất cả thông báo, sắp xếp theo ngày đăng mới nhất
   */
  async findAll() {
    try {
      const { data, error } = await supabase
        .from('ThongBao')
        .select('*, id:thong_bao_id')
        .order('ngay_dang', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Tạo thông báo mới
   */
  async create({ tieu_de, noi_dung, loai }) {
    try {
      const { data, error } = await supabase
        .from('ThongBao')
        .insert([{
          tieu_de,
          noi_dung,
          loai,
          ngay_dang: new Date().toISOString()
        }])
        .select('*, id:thong_bao_id');

      if (error) throw error;
      return data[0];
    } catch (err) {
      throw err;
    }
  },

  /**
   * Xóa thông báo theo ID
   */
  async deleteById(id) {
    try {
      const { error } = await supabase
        .from('ThongBao')
        .delete()
        .eq('thong_bao_id', id);

      if (error) throw error;
      return { success: true, changes: 1, id, thong_bao_id: id };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Cập nhật thông báo theo ID
   */
  async updateById(id, { tieu_de, noi_dung, loai }) {
    try {
      const { error } = await supabase
        .from('ThongBao')
        .update({ tieu_de, noi_dung, loai })
        .eq('thong_bao_id', id);

      if (error) throw error;
      return { success: true, changes: 1 };
    } catch (err) {
      throw err;
    }
  }
};

export default ThongBao;
