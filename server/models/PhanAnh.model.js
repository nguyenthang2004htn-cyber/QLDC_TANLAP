import db from '../config/database.js';
import sql from 'mssql/msnodesqlv8.js';

const PhanAnh = {
  /**
   * Lấy danh sách phản ánh, có thể lọc theo khu vực hoặc người dân
   */
  async findAll(area, citizenId) {
    try {
      const pool = await db.getPool();
      let queryStr = `SELECT p.*, p.phan_anh_id AS id, n.ho_ten AS citizen FROM PhanAnh p
                      LEFT JOIN TaiKhoan n ON p.nguoi_dan_id = n.tai_khoan_id`;
      const request = pool.request();

      if (citizenId) {
        queryStr += ' WHERE p.nguoi_dan_id = @citizenId';
        request.input('citizenId', sql.Int, citizenId);
      } else if (area) {
        queryStr += ' WHERE p.khu_pho LIKE @area OR p.dia_chi LIKE @area';
        request.input('area', sql.NVarChar, `%${area}%`);
      }

      const result = await request.query(queryStr);
      return result.recordset;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Tạo phản ánh mới
   */
  async create({ tieu_de, noi_dung, loai, dia_chi, nguoi_dan_id, khu_pho, so_dien_thoai, chuyen_muc, linh_vuc, hinh_thuc, nguon, han_xu_ly, cong_khai, don_vi_xu_ly, hinh_anh }) {
    try {
      const pool = await db.getPool();
      let queryStr = `
        INSERT INTO PhanAnh (
          tieu_de, noi_dung, loai, dia_chi, ngay_gui, trang_thai, 
          nguoi_dan_id, khu_pho, so_dien_thoai, chuyen_muc, linh_vuc, 
          hinh_thuc, nguon, han_xu_ly, cong_khai, don_vi_xu_ly, hinh_anh
        )
        VALUES (
          @tieu_de, @noi_dung, @loai, @dia_chi, GETDATE(), 'pending', 
          @nguoi_dan_id, @khu_pho, @so_dien_thoai, @chuyen_muc, @linh_vuc, 
          @hinh_thuc, @nguon, @han_xu_ly, @cong_khai, @don_vi_xu_ly, @hinh_anh
        );
        SELECT SCOPE_IDENTITY() AS phan_anh_id;`;
        
      const result = await pool.request()
        .input('tieu_de', sql.NVarChar, tieu_de)
        .input('noi_dung', sql.NVarChar, noi_dung)
        .input('loai', sql.NVarChar, loai)
        .input('dia_chi', sql.NVarChar, dia_chi || '')
        .input('nguoi_dan_id', sql.Int, nguoi_dan_id)
        .input('khu_pho', sql.NVarChar, khu_pho || '')
        .input('so_dien_thoai', sql.VarChar, so_dien_thoai || '')
        .input('chuyen_muc', sql.NVarChar, chuyen_muc || '')
        .input('linh_vuc', sql.NVarChar, linh_vuc || '')
        .input('hinh_thuc', sql.NVarChar, hinh_thuc || '')
        .input('nguon', sql.NVarChar, nguon || 'App người dân')
        .input('han_xu_ly', sql.DateTime, han_xu_ly || null)
        .input('cong_khai', sql.Bit, cong_khai || 0)
        .input('don_vi_xu_ly', sql.NVarChar, don_vi_xu_ly || 'UBND Phường')
        .input('hinh_anh', sql.NVarChar, hinh_anh || null)
        .query(queryStr);

      const newId = result.recordset[0].phan_anh_id;
      return {
        id: newId,
        phan_anh_id: newId,
        tieu_de, noi_dung, loai, dia_chi, khu_pho, nguoi_dan_id,
        so_dien_thoai, chuyen_muc, linh_vuc, hinh_thuc, nguon, han_xu_ly, cong_khai, don_vi_xu_ly, hinh_anh,
        trang_thai: 'pending',
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
      const pool = await db.getPool();
      const request = pool.request()
        .input('trang_thai', sql.VarChar, trang_thai)
        .input('id', sql.Int, id);
        
      let queryStr = `UPDATE PhanAnh SET trang_thai = @trang_thai`;

      if (ket_qua_xu_ly !== undefined && ket_qua_xu_ly !== null) {
        queryStr += `, ket_qua_xu_ly = @ket_qua_xu_ly`;
        request.input('ket_qua_xu_ly', sql.NVarChar, ket_qua_xu_ly);
      }

      queryStr += ` WHERE phan_anh_id = @id`;

      const result = await request.query(queryStr);
      return { success: true, changes: result.rowsAffected[0], id, phan_anh_id: id, trang_thai, ket_qua_xu_ly };
    } catch (err) {
      throw err;
    }
  }
};

export default PhanAnh;
