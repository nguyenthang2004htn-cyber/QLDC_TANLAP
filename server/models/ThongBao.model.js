import db from '../config/database.js';
import sql from 'mssql/msnodesqlv8.js';

const ThongBao = {
  /**
   * Lấy tất cả thông báo, sắp xếp theo ngày đăng mới nhất
   */
  async findAll() {
    try {
      const pool = await db.getPool();
      const result = await pool.request().query('SELECT *, thong_bao_id AS id FROM ThongBao ORDER BY ngay_dang DESC');
      return result.recordset;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Tạo thông báo mới
   */
  async create({ tieu_de, noi_dung, loai }) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('tieu_de', sql.NVarChar, tieu_de)
        .input('noi_dung', sql.NVarChar, noi_dung)
        .input('loai', sql.VarChar, loai)
        .query(`
          INSERT INTO ThongBao (tieu_de, noi_dung, ngay_dang, loai)
          OUTPUT INSERTED.thong_bao_id AS id, INSERTED.thong_bao_id, INSERTED.ngay_dang
          VALUES (@tieu_de, @noi_dung, GETDATE(), @loai)
        `);
      return {
        id: result.recordset[0].id,
        thong_bao_id: result.recordset[0].thong_bao_id,
        tieu_de, 
        noi_dung, 
        loai,
        ngay_dang: result.recordset[0].ngay_dang
      };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Xóa thông báo theo ID
   */
  async deleteById(id) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM ThongBao WHERE thong_bao_id = @id');
      return { success: true, changes: result.rowsAffected[0], id, thong_bao_id: id };
    } catch (err) {
      throw err;
    }
  },
  /**
   * Cập nhật thông báo theo ID
   */
  async updateById(id, { tieu_de, noi_dung, loai }) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('tieu_de', sql.NVarChar, tieu_de)
        .input('noi_dung', sql.NVarChar, noi_dung)
        .input('loai', sql.VarChar, loai)
        .query(`
          UPDATE ThongBao
          SET tieu_de = @tieu_de, noi_dung = @noi_dung, loai = @loai
          WHERE thong_bao_id = @id
        `);
      return { success: true, changes: result.rowsAffected[0] };
    } catch (err) {
      throw err;
    }
  }
};

export default ThongBao;
