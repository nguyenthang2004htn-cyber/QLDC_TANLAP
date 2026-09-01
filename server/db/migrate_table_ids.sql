-- Script cập nhật đổi tên cột id thành [ten_bang]_id cho các bảng đã tồn tại trong SQL Server

USE QuanLyDanCu1;
GO

-- 1. Bảng DonVi: id -> don_vi_id
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('DonVi') AND name = 'id')
BEGIN
    EXEC sp_rename 'DonVi.id', 'don_vi_id', 'COLUMN';
    PRINT N'Đã đổi tên DonVi.id -> DonVi.don_vi_id';
END;
GO

-- 2. Bảng CanBo: id -> can_bo_id
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CanBo') AND name = 'id')
BEGIN
    EXEC sp_rename 'CanBo.id', 'can_bo_id', 'COLUMN';
    PRINT N'Đã đổi tên CanBo.id -> CanBo.can_bo_id';
END;
GO

-- 3. Bảng TaiKhoan: id -> tai_khoan_id
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('TaiKhoan') AND name = 'id')
BEGIN
    EXEC sp_rename 'TaiKhoan.id', 'tai_khoan_id', 'COLUMN';
    PRINT N'Đã đổi tên TaiKhoan.id -> TaiKhoan.tai_khoan_id';
END;
GO

-- 4. Bảng PhanAnh: id -> phan_anh_id
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PhanAnh') AND name = 'id')
BEGIN
    EXEC sp_rename 'PhanAnh.id', 'phan_anh_id', 'COLUMN';
    PRINT N'Đã đổi tên PhanAnh.id -> PhanAnh.phan_anh_id';
END;
GO

-- 5. Bảng ThongBao: id -> thong_bao_id
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ThongBao') AND name = 'id')
BEGIN
    EXEC sp_rename 'ThongBao.id', 'thong_bao_id', 'COLUMN';
    PRINT N'Đã đổi tên ThongBao.id -> ThongBao.thong_bao_id';
END;
GO

-- 6. Bảng NhatKy: id -> nhat_ky_id
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('NhatKy') AND name = 'id')
BEGIN
    EXEC sp_rename 'NhatKy.id', 'nhat_ky_id', 'COLUMN';
    PRINT N'Đã đổi tên NhatKy.id -> NhatKy.nhat_ky_id';
END;
GO
