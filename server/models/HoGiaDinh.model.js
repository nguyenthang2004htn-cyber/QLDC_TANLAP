import supabase from '../config/database.js';

const HoGiaDinh = {
  async create({ chu_ho_id, ten_chu_ho, dia_chi, so_thanh_vien, ghi_chu, khu_vuc, nam_sinh, lat, lng }) {
    try {
      const { data, error } = await supabase
        .from('HoGiaDinh')
        .insert([{
          chu_ho_id,
          ten_chu_ho,
          dia_chi,
          so_thanh_vien,
          ghi_chu: ghi_chu || '',
          khu_vuc: khu_vuc || '',
          nam_sinh: nam_sinh || null,
          lat: lat || null,
          lng: lng || null,
          trang_thai: 'Chờ duyệt',
          ngay_khai_bao: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      throw err;
    }
  },

  async getByChuHoId(chu_ho_id) {
    try {
      const { data, error } = await supabase
        .from('HoGiaDinh')
        .select('*')
        .eq('chu_ho_id', chu_ho_id)
        .order('ngay_khai_bao', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  },

  async getAll(managed_area = '') {
    try {
      let query = supabase
        .from('HoGiaDinh')
        .select(`
          *,
          TaiKhoan (
            dien_thoai
          )
        `)
        .order('ngay_khai_bao', { ascending: false });

      if (managed_area) {
        query = query.eq('khu_vuc', managed_area);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(item => ({
        ...item,
        dien_thoai: item.TaiKhoan?.dien_thoai || null
      }));
    } catch (err) {
      throw err;
    }
  },

  async update(ho_gia_dinh_id, { ten_chu_ho, dia_chi, so_thanh_vien, ghi_chu, nam_sinh, lat, lng }) {
    try {
      const { data, error } = await supabase
        .from('HoGiaDinh')
        .update({
          ten_chu_ho,
          dia_chi,
          so_thanh_vien,
          ghi_chu: ghi_chu || '',
          nam_sinh: nam_sinh || null,
          lat: lat || null,
          lng: lng || null
        })
        .eq('ho_gia_dinh_id', ho_gia_dinh_id)
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      throw err;
    }
  },

  async updateStatus(ho_gia_dinh_id, trang_thai) {
    try {
      const { data, error } = await supabase
        .from('HoGiaDinh')
        .update({ trang_thai })
        .eq('ho_gia_dinh_id', ho_gia_dinh_id)
        .select();

      if (error) throw error;
      return { ho_gia_dinh_id, trang_thai };
    } catch (err) {
      throw err;
    }
  },

  async delete(ho_gia_dinh_id) {
    try {
      const { error } = await supabase
        .from('HoGiaDinh')
        .delete()
        .eq('ho_gia_dinh_id', ho_gia_dinh_id);

      if (error) throw error;
      return { success: true, changes: 1 };
    } catch (err) {
      throw err;
    }
  }
};

export default HoGiaDinh;
