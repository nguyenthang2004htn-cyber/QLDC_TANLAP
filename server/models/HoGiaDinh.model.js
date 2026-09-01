import db from '../config/database.js';
import sql from 'mssql/msnodesqlv8.js';

const HoGiaDinh = {
  async create({ chu_ho_id, ten_chu_ho, dia_chi, so_thanh_vien, ghi_chu, khu_vuc, nam_sinh, lat, lng }) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('chu_ho_id', sql.Int, chu_ho_id)
        .input('ten_chu_ho', sql.NVarChar, ten_chu_ho)
        .input('dia_chi', sql.NVarChar, dia_chi)
        .input('so_thanh_vien', sql.Int, so_thanh_vien)
        .input('ghi_chu', sql.NVarChar, ghi_chu || '')
        .input('khu_vuc', sql.NVarChar, khu_vuc || '')
        .input('nam_sinh', sql.Int, nam_sinh || null)
        .input('lat', sql.Float, lat || null)
        .input('lng', sql.Float, lng || null)
        .query(`
          INSERT INTO HoGiaDinh (chu_ho_id, ten_chu_ho, dia_chi, so_thanh_vien, ghi_chu, khu_vuc, nam_sinh, lat, lng)
          VALUES (@chu_ho_id, @ten_chu_ho, @dia_chi, @so_thanh_vien, @ghi_chu, @khu_vuc, @nam_sinh, @lat, @lng);
          SELECT SCOPE_IDENTITY() AS ho_gia_dinh_id;
        `);
      return { 
        ho_gia_dinh_id: result.recordset[0].ho_gia_dinh_id,
        chu_ho_id, ten_chu_ho, dia_chi, so_thanh_vien, ghi_chu, khu_vuc, nam_sinh, lat, lng,
        trang_thai: 'Chờ duyệt'
      };
    } catch (err) {
      throw err;
    }
  },

  async getByChuHoId(chu_ho_id) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('chu_ho_id', sql.Int, chu_ho_id)
        .query(`
          SELECT * FROM HoGiaDinh
          WHERE chu_ho_id = @chu_ho_id
          ORDER BY ngay_khai_bao DESC
        `);
      return result.recordset;
    } catch (err) {
      throw err;
    }
  },

  async getAll(managed_area = '') {
    try {
      const pool = await db.getPool();
      const req = pool.request();
      let q = `
        SELECT h.*, t.dien_thoai
        FROM HoGiaDinh h
        LEFT JOIN TaiKhoan t ON h.chu_ho_id = t.tai_khoan_id
      `;
      if (managed_area) {
        req.input('managed_area', sql.NVarChar, managed_area);
        q += ` WHERE h.khu_vuc = @managed_area`;
      }
      q += ` ORDER BY h.ngay_khai_bao DESC`;

      const result = await req.query(q);
      return result.recordset;
    } catch (err) {
      throw err;
    }
  },

  async update(ho_gia_dinh_id, { ten_chu_ho, dia_chi, so_thanh_vien, ghi_chu, nam_sinh, lat, lng }) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('id', sql.Int, ho_gia_dinh_id)
        .input('ten_chu_ho', sql.NVarChar, ten_chu_ho)
        .input('dia_chi', sql.NVarChar, dia_chi)
        .input('so_thanh_vien', sql.Int, so_thanh_vien)
        .input('ghi_chu', sql.NVarChar, ghi_chu || '')
        .input('nam_sinh', sql.Int, nam_sinh || null)
        .input('lat', sql.Float, lat || null)
        .input('lng', sql.Float, lng || null)
        .query(`
          UPDATE HoGiaDinh
          SET ten_chu_ho = @ten_chu_ho,
              dia_chi = @dia_chi,
              so_thanh_vien = @so_thanh_vien,
              ghi_chu = @ghi_chu,
              nam_sinh = @nam_sinh,
              lat = @lat,
              lng = @lng
          WHERE ho_gia_dinh_id = @id
        `);
      return { ho_gia_dinh_id, ten_chu_ho, dia_chi, so_thanh_vien, ghi_chu, nam_sinh, lat, lng };
    } catch (err) {
      throw err;
    }
  },

  async updateStatus(ho_gia_dinh_id, trang_thai) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('id', sql.Int, ho_gia_dinh_id)
        .input('trang_thai', sql.NVarChar, trang_thai)
        .query(`
          UPDATE HoGiaDinh
          SET trang_thai = @trang_thai
          WHERE ho_gia_dinh_id = @id
        `);
      return { ho_gia_dinh_id, trang_thai };
    } catch (err) {
      throw err;
    }
  },

  async delete(ho_gia_dinh_id) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('id', sql.Int, ho_gia_dinh_id)
        .query(`
          DELETE FROM HoGiaDinh
          WHERE ho_gia_dinh_id = @id
        `);
      return { success: true, changes: result.rowsAffected[0] };
    } catch (err) {
      throw err;
    }
  }
};

export default HoGiaDinh;
