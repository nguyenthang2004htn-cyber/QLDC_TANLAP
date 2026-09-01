import supabase from '../config/database.js';

const PhanAnh = {
  /**
   * Lấy danh sách phản ánh, có thể lọc theo khu vực hoặc người dân
   */
  async findAll(area, citizenId) {
    try {
      let query = supabase
        .from('PhanAnh')
        .select(`
          *,
          id:phan_anh_id,
          TaiKhoan (
            ho_ten
          )
        `);

      if (citizenId) {
        query = query.eq('nguoi_dan_id', citizenId);
      } else if (area) {
        query = query.or(`khu_pho.ilike.%${area}%,dia_chi.ilike.%${area}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform to match old return signature
      return data.map(item => ({
        ...item,
        citizen: item.TaiKhoan?.ho_ten || null
      }));
    } catch (err) {
      throw err;
    }
  },

  /**
   * Tạo phản ánh mới
   */
  async create({ tieu_de, noi_dung, loai, dia_chi, nguoi_dan_id, khu_pho, so_dien_thoai, chuyen_muc, linh_vuc, hinh_thuc, nguon, han_xu_ly, cong_khai, don_vi_xu_ly, hinh_anh }) {
    try {
      const newReport = {
        tieu_de,
        noi_dung,
        loai,
        dia_chi: dia_chi || '',
        nguoi_dan_id,
        khu_pho: khu_pho || '',
        so_dien_thoai: so_dien_thoai || '',
        chuyen_muc: chuyen_muc || '',
        linh_vuc: linh_vuc || '',
        hinh_thuc: hinh_thuc || '',
        nguon: nguon || 'App người dân',
        han_xu_ly: han_xu_ly || null,
        cong_khai: cong_khai || 0,
        don_vi_xu_ly: don_vi_xu_ly || 'UBND Phường',
        hinh_anh: hinh_anh || null,
        trang_thai: 'pending',
        ngay_gui: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('PhanAnh')
        .insert([newReport])
        .select();

      if (error) throw error;

      const newId = data[0].phan_anh_id;
      return {
        ...data[0],
        id: newId
      };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Cập nhật trạng thái phản ánh
   */
  async updateStatus(id, trang_thai, ket_qua_xu_ly) {
    try {
      const updates = { trang_thai };
      if (ket_qua_xu_ly !== undefined && ket_qua_xu_ly !== null) {
        updates.ket_qua_xu_ly = ket_qua_xu_ly;
      }

      const { data, error } = await supabase
        .from('PhanAnh')
        .update(updates)
        .eq('phan_anh_id', id)
        .select();

      if (error) throw error;
      return { success: true, changes: 1, id, phan_anh_id: id, trang_thai, ket_qua_xu_ly };
    } catch (err) {
      throw err;
    }
  }
};

export default PhanAnh;
