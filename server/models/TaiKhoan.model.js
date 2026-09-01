import db from '../config/database.js';
import sql from 'mssql/msnodesqlv8.js';

const TaiKhoan = {
  /**
   * Tìm tài khoản theo tên đăng nhập và mật khẩu (đăng nhập)
   */
  async findByCredentials(username, password) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .input('password', sql.VarChar, password)
        .query(`
          SELECT tai_khoan_id AS id, tai_khoan_id, ten_dang_nhap, dien_thoai, ho_ten, vai_tro, cho_thuong_tru, que_quan, nam_sinh, managed_area
          FROM TaiKhoan 
          WHERE (ten_dang_nhap = @username OR dien_thoai = @username) AND mat_khau = @password
        `);
      return result.recordset[0];
    } catch (err) {
      throw err;
    }
  },

  /**
   * Tìm tài khoản theo ID (xem profile)
   */
  async findById(id) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT tai_khoan_id AS id, tai_khoan_id, ten_dang_nhap, ho_ten, vai_tro, cho_thuong_tru, que_quan, nam_sinh, managed_area 
          FROM TaiKhoan 
          WHERE tai_khoan_id = @id
        `);
      return result.recordset[0];
    } catch (err) {
      throw err;
    }
  },

  /**
   * Cập nhật thông tin tài khoản
   */
  async updateById(id, { ho_ten, mat_khau, cho_thuong_tru, que_quan, nam_sinh }) {
    try {
      const pool = await db.getPool();
      const request = pool.request()
        .input('ho_ten', sql.NVarChar, ho_ten)
        .input('cho_thuong_tru', sql.NVarChar, cho_thuong_tru)
        .input('que_quan', sql.NVarChar, que_quan)
        .input('nam_sinh', sql.Int, nam_sinh)
        .input('id', sql.Int, id);

      let pQuery = `UPDATE TaiKhoan SET ho_ten = @ho_ten, cho_thuong_tru = @cho_thuong_tru, que_quan = @que_quan, nam_sinh = @nam_sinh`;

      if (mat_khau) {
        request.input('mat_khau', sql.VarChar, mat_khau);
        pQuery += `, mat_khau = @mat_khau`;
      }
      pQuery += ` WHERE tai_khoan_id = @id`;

      const result = await request.query(pQuery);
      return { success: true, changes: result.rowsAffected[0] };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Đăng ký tài khoản mới (vai trò mặc định: citizen)
   */
  async create({ ten_dang_nhap, mat_khau, ho_ten, cho_thuong_tru, que_quan, nam_sinh }) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('ten_dang_nhap', sql.VarChar, ten_dang_nhap)
        .input('mat_khau', sql.VarChar, mat_khau)
        .input('ho_ten', sql.NVarChar, ho_ten)
        .input('cho_thuong_tru', sql.NVarChar, cho_thuong_tru)
        .input('que_quan', sql.NVarChar, que_quan)
        .input('nam_sinh', sql.Int, nam_sinh)
        .query(`
          INSERT INTO TaiKhoan (ten_dang_nhap, mat_khau, ho_ten, vai_tro, cho_thuong_tru, que_quan, nam_sinh)
          OUTPUT INSERTED.tai_khoan_id AS id, INSERTED.tai_khoan_id
          VALUES (@ten_dang_nhap, @mat_khau, @ho_ten, 'citizen', @cho_thuong_tru, @que_quan, @nam_sinh)
        `);
      return { id: result.recordset[0].id, tai_khoan_id: result.recordset[0].tai_khoan_id };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Tìm tài khoản theo username (để kiểm tra tồn tại hoặc quên mật khẩu)
   */
  async findByUsername(username) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('username', sql.VarChar, username)
        .query(`SELECT tai_khoan_id AS id, tai_khoan_id, ten_dang_nhap, ho_ten, vai_tro FROM TaiKhoan WHERE ten_dang_nhap = @username`);
      return result.recordset[0];
    } catch (err) {
      throw err;
    }
  },

  /**
   * Cập nhật mật khẩu bằng username (đặt lại mật khẩu)
   */
  async updatePassword(username, newPassword) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('newPassword', sql.VarChar, newPassword)
        .input('username', sql.VarChar, username)
        .query(`UPDATE TaiKhoan SET mat_khau = @newPassword WHERE ten_dang_nhap = @username`);
      return { success: true, changes: result.rowsAffected[0] };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Lấy tất cả người dùng (Admin chỉ định)
   */
  async findAll() {
    try {
      const pool = await db.getPool();
      const result = await pool.request().query(`
        SELECT tai_khoan_id AS id, tai_khoan_id, ten_dang_nhap, ho_ten, vai_tro, cho_thuong_tru, que_quan, nam_sinh, managed_area 
        FROM TaiKhoan
      `);
      return result.recordset;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Cập nhật vai trò và khu vực quản lý
   */
  async updateRole(id, vai_tro, managed_area) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('vai_tro', sql.VarChar, vai_tro)
        .input('managed_area', sql.NVarChar, managed_area)
        .input('id', sql.Int, id)
        .query(`UPDATE TaiKhoan SET vai_tro = @vai_tro, managed_area = @managed_area WHERE tai_khoan_id = @id`);
      return { success: true, changes: result.rowsAffected[0] };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Xóa tài khoản
   */
  async deleteById(id) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM TaiKhoan WHERE tai_khoan_id = @id`);
      return { success: true, changes: result.rowsAffected[0] };
    } catch (err) {
      throw err;
    }
  },

  /**
   * Tạo tài khoản với vai trò chỉ định (cho Admin/IT Admin)
   */
  async createWithRole({ ten_dang_nhap, mat_khau, ho_ten, vai_tro, managed_area, cho_thuong_tru, que_quan, nam_sinh }) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('ten_dang_nhap', sql.VarChar, ten_dang_nhap)
        .input('mat_khau', sql.VarChar, mat_khau)
        .input('ho_ten', sql.NVarChar, ho_ten)
        .input('vai_tro', sql.VarChar, vai_tro || 'citizen')
        .input('managed_area', sql.NVarChar, managed_area || null)
        .input('cho_thuong_tru', sql.NVarChar, cho_thuong_tru || '')
        .input('que_quan', sql.NVarChar, que_quan || '')
        .input('nam_sinh', sql.Int, nam_sinh || null)
        .query(`
          INSERT INTO TaiKhoan (ten_dang_nhap, mat_khau, ho_ten, vai_tro, managed_area, cho_thuong_tru, que_quan, nam_sinh)
          OUTPUT INSERTED.tai_khoan_id AS id, INSERTED.ten_dang_nhap, INSERTED.ho_ten, INSERTED.vai_tro
          VALUES (@ten_dang_nhap, @mat_khau, @ho_ten, @vai_tro, @managed_area, @cho_thuong_tru, @que_quan, @nam_sinh)
        `);
      return result.recordset[0];
    } catch (err) {
      throw err;
    }
  }
};

export default TaiKhoan;
