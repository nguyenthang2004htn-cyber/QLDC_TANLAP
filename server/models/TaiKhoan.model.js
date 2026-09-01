import supabase from '../config/database.js';

const TaiKhoan = {
  /**
   * Tìm tài khoản theo tên đăng nhập và mật khẩu (đăng nhập)
   */
  async findByCredentials(username, password) {
    try {
      const { data, error } = await supabase
        .from('TaiKhoan')
        .select('id:tai_khoan_id, tai_khoan_id, ten_dang_nhap, dien_thoai, ho_ten, vai_tro, cho_thuong_tru, que_quan, nam_sinh, managed_area')
        .eq('mat_khau', password)
        .or(`ten_dang_nhap.eq.${username},dien_thoai.eq.${username}`);
      
      if (error) throw error;
      return data[0];
    } catch (err) {
      throw err;
    }
  },

  /**
   * Tìm tài khoản theo ID (xem profile)
   */
  async findById(id) {
    try {
      const { data, error } = await supabase
        .from('TaiKhoan')
        .select('id:tai_khoan_id, tai_khoan_id, ten_dang_nhap, ho_ten, vai_tro, cho_thuong_tru, que_quan, nam_sinh, managed_area')
        .eq('tai_khoan_id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
      return data;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Cập nhật thông tin tài khoản
   */
  async updateById(id, { ho_ten, mat_khau, cho_thuong_tru, que_quan, nam_sinh }) {
    try {
      const updates = { ho_ten, cho_thuong_tru, que_quan, nam_sinh };
      if (mat_khau) updates.mat_khau = mat_khau;

      const { data, error } = await supabase
        .from('TaiKhoan')
        .update(updates)
        .eq('tai_khoan_id', id);

      if (error) throw error;
      return { success: true, changes: 1 };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Đăng ký tài khoản mới (vai trò mặc định: citizen)
   */
  async create({ ten_dang_nhap, mat_khau, ho_ten, cho_thuong_tru, que_quan, nam_sinh }) {
    try {
      const { data, error } = await supabase
        .from('TaiKhoan')
        .insert([{
          ten_dang_nhap,
          mat_khau,
          ho_ten,
          cho_thuong_tru,
          que_quan,
          nam_sinh,
          vai_tro: 'citizen'
        }])
        .select();

      if (error) throw error;
      return { id: data[0].tai_khoan_id, tai_khoan_id: data[0].tai_khoan_id };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Tìm tài khoản theo username (để kiểm tra tồn tại hoặc quên mật khẩu)
   */
  async findByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('TaiKhoan')
        .select('id:tai_khoan_id, tai_khoan_id, ten_dang_nhap, ho_ten, vai_tro')
        .eq('ten_dang_nhap', username)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Cập nhật mật khẩu bằng username (đặt lại mật khẩu)
   */
  async updatePassword(username, newPassword) {
    try {
      const { data, error } = await supabase
        .from('TaiKhoan')
        .update({ mat_khau: newPassword })
        .eq('ten_dang_nhap', username);

      if (error) throw error;
      return { success: true, changes: 1 };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Lấy tất cả người dùng (Admin chỉ định)
   */
  async findAll() {
    try {
      const { data, error } = await supabase
        .from('TaiKhoan')
        .select('id:tai_khoan_id, tai_khoan_id, ten_dang_nhap, ho_ten, vai_tro, cho_thuong_tru, que_quan, nam_sinh, managed_area');
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Cập nhật vai trò và khu vực quản lý
   */
  async updateRole(id, vai_tro, managed_area) {
    try {
      const { data, error } = await supabase
        .from('TaiKhoan')
        .update({ vai_tro, managed_area })
        .eq('tai_khoan_id', id);

      if (error) throw error;
      return { success: true, changes: 1 };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Xóa tài khoản
   */
  async deleteById(id) {
    try {
      const { error } = await supabase
        .from('TaiKhoan')
        .delete()
        .eq('tai_khoan_id', id);

      if (error) throw error;
      return { success: true, changes: 1 };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Tạo tài khoản với vai trò chỉ định (cho Admin/IT Admin)
   */
  async createWithRole({ ten_dang_nhap, mat_khau, ho_ten, vai_tro, managed_area, cho_thuong_tru, que_quan, nam_sinh }) {
    try {
      const { data, error } = await supabase
        .from('TaiKhoan')
        .insert([{
          ten_dang_nhap,
          mat_khau,
          ho_ten,
          vai_tro: vai_tro || 'citizen',
          managed_area: managed_area || null,
          cho_thuong_tru: cho_thuong_tru || '',
          que_quan: que_quan || '',
          nam_sinh: nam_sinh || null
        }])
        .select('id:tai_khoan_id, ten_dang_nhap, ho_ten, vai_tro');

      if (error) throw error;
      return data[0];
    } catch (err) {
      throw err;
    }
  }
};

export default TaiKhoan;
