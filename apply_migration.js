import db from './server/config/database.js';

async function applyMigration() {
  try {
    const pool = await db.getPool();
    console.log('--- Đang thực hiện cập nhật tên cột ID cho Database ---');

    // 1. Rename columns if 'id' exists
    const alterScripts = [
      `IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('DonVi') AND name = 'id') EXEC sp_rename 'DonVi.id', 'don_vi_id', 'COLUMN';`,
      `IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CanBo') AND name = 'id') EXEC sp_rename 'CanBo.id', 'can_bo_id', 'COLUMN';`,
      `IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('TaiKhoan') AND name = 'id') EXEC sp_rename 'TaiKhoan.id', 'tai_khoan_id', 'COLUMN';`,
      `IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PhanAnh') AND name = 'id') EXEC sp_rename 'PhanAnh.id', 'phan_anh_id', 'COLUMN';`,
      `IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ThongBao') AND name = 'id') EXEC sp_rename 'ThongBao.id', 'thong_bao_id', 'COLUMN';`,
      `IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NhatKy') AND name = 'id') EXEC sp_rename 'NhatKy.id', 'nhat_ky_id', 'COLUMN';`,
    ];

    for (const sqlStr of alterScripts) {
      await pool.request().query(sqlStr);
    }
    console.log('Đã đổi tên cột ID thành công.');

    // 2. Re-create triggers
    console.log('Đang cập nhật Trigger trg_after_insert_phananh & trg_after_update_phananh...');
    await pool.request().query(`
      CREATE OR ALTER TRIGGER trg_after_insert_phananh
      ON PhanAnh
      AFTER INSERT
      AS
      BEGIN
        INSERT INTO NhatKy (ngay_gio, hanh_dong, nguoi_thuc_hien, phan_anh_id, tham_chieu)
        SELECT GETDATE(), N'Tạo phản ánh mới', N'Hệ thống', phan_anh_id, tieu_de
        FROM inserted;
      END;
    `);

    await pool.request().query(`
      CREATE OR ALTER TRIGGER trg_after_update_phananh
      ON PhanAnh
      AFTER UPDATE
      AS
      BEGIN
        INSERT INTO NhatKy (ngay_gio, hanh_dong, nguoi_thuc_hien, phan_anh_id, tham_chieu)
        SELECT GETDATE(), N'Cập nhật phản ánh', N'Hệ thống', phan_anh_id, tieu_de
        FROM inserted;
      END;
    `);

    console.log('=== MIGRATION COMPLETED SUCCESSFULLY ===');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi thực thi migration:', err);
    process.exit(1);
  }
}

applyMigration();
