-- Lệnh tạo Database (Bạn nên tạo thủ công trước bằng SSMS, nhưng nếu thả script từ đầu thì bật cái này lên)
-- CREATE DATABASE QuanLyDanCu;
-- GO
-- USE QuanLyDanCu;
-- GO

CREATE TABLE DonVi (
  don_vi_id INT IDENTITY(1,1) PRIMARY KEY,
  ten_don_vi NVARCHAR(255) NOT NULL,
  mo_ta NVARCHAR(MAX)
);

CREATE TABLE CanBo (
  can_bo_id INT IDENTITY(1,1) PRIMARY KEY,
  ho_ten NVARCHAR(255) NOT NULL,
  chuc_vu NVARCHAR(100),
  dien_thoai NVARCHAR(50),
  don_vi_id INT,
  FOREIGN KEY (don_vi_id) REFERENCES DonVi(don_vi_id) ON DELETE SET NULL
);

CREATE TABLE TaiKhoan (
  tai_khoan_id INT IDENTITY(1,1) PRIMARY KEY,
  ten_dang_nhap NVARCHAR(100) NOT NULL UNIQUE,
  dien_thoai NVARCHAR(50) UNIQUE,
  mat_khau NVARCHAR(255) NOT NULL,
  ho_ten NVARCHAR(255) NOT NULL,
  vai_tro NVARCHAR(50) NOT NULL,
  cho_thuong_tru NVARCHAR(255),
  que_quan NVARCHAR(255),
  nam_sinh INT,
  managed_area NVARCHAR(255),
  can_bo_id INT,
  FOREIGN KEY (can_bo_id) REFERENCES CanBo(can_bo_id) ON DELETE SET NULL
);

CREATE TABLE PhanAnh (
  phan_anh_id INT IDENTITY(1,1) PRIMARY KEY,
  tieu_de NVARCHAR(255) NOT NULL,
  noi_dung NVARCHAR(MAX) NOT NULL,
  loai NVARCHAR(100) NOT NULL,
  dia_chi NVARCHAR(255),
  ngay_gui DATETIME NOT NULL,
  trang_thai NVARCHAR(50) NOT NULL,
  nguoi_dan_id INT,
  khu_pho NVARCHAR(100),
  so_dien_thoai NVARCHAR(50),
  chuyen_muc NVARCHAR(100),
  linh_vuc NVARCHAR(100),
  hinh_thuc NVARCHAR(100),
  nguon NVARCHAR(100) DEFAULT N'App người dân',
  han_xu_ly DATETIME,
  cong_khai INT DEFAULT 0,
  don_vi_xu_ly NVARCHAR(100),
  ket_qua_xu_ly NVARCHAR(MAX) NULL,
  hinh_anh NVARCHAR(500) NULL,
  FOREIGN KEY (nguoi_dan_id) REFERENCES TaiKhoan(tai_khoan_id) ON DELETE SET NULL
);

CREATE TABLE ThongBao (
  thong_bao_id INT IDENTITY(1,1) PRIMARY KEY,
  tieu_de NVARCHAR(255) NOT NULL,
  noi_dung NVARCHAR(MAX) NOT NULL,
  ngay_dang DATETIME NOT NULL,
  loai NVARCHAR(100) NOT NULL
);

CREATE TABLE NhatKy (
  nhat_ky_id INT IDENTITY(1,1) PRIMARY KEY,
  ngay_gio DATETIME NOT NULL,
  hanh_dong NVARCHAR(255) NOT NULL,
  nguoi_thuc_hien NVARCHAR(255),
  phan_anh_id INT,
  tham_chieu NVARCHAR(255),
  FOREIGN KEY (phan_anh_id) REFERENCES PhanAnh(phan_anh_id) ON DELETE SET NULL
);
GO

-- Stored Procedure tạo Phản ảnh
CREATE PROCEDURE sp_ThemPhanAnh
  @p_tieu_de NVARCHAR(255),
  @p_noi_dung NVARCHAR(MAX),
  @p_loai NVARCHAR(100),
  @p_dia_chi NVARCHAR(255),
  @p_nguoi_dan_id INT,
  @p_khu_pho NVARCHAR(100),
  @p_so_dien_thoai NVARCHAR(50),
  @p_chuyen_muc NVARCHAR(100),
  @p_linh_vuc NVARCHAR(100),
  @p_hinh_thuc NVARCHAR(100),
  @p_nguon NVARCHAR(100),
  @p_han_xu_ly DATETIME,
  @p_cong_khai INT,
  @p_don_vi_xu_ly NVARCHAR(100)
AS
BEGIN
  BEGIN TRANSACTION;
  
  INSERT INTO PhanAnh (tieu_de, noi_dung, loai, dia_chi, ngay_gui, trang_thai, nguoi_dan_id, khu_pho, so_dien_thoai, chuyen_muc, linh_vuc, hinh_thuc, nguon, han_xu_ly, cong_khai, don_vi_xu_ly)
  VALUES (@p_tieu_de, @p_noi_dung, @p_loai, @p_dia_chi, GETDATE(), 'pending', @p_nguoi_dan_id, @p_khu_pho, @p_so_dien_thoai, @p_chuyen_muc, @p_linh_vuc, @p_hinh_thuc, @p_nguon, @p_han_xu_ly, @p_cong_khai, @p_don_vi_xu_ly);
  
  DECLARE @new_id INT = SCOPE_IDENTITY();
  
  INSERT INTO NhatKy (ngay_gio, hanh_dong, nguoi_thuc_hien, phan_anh_id, tham_chieu)
  VALUES (GETDATE(), N'Tạo phản ánh mới', N'Hệ thống', @new_id, @p_tieu_de);
  
  COMMIT TRANSACTION;
END;
GO

-- Stored Procedure cập nhật thông tin cá nhân
CREATE PROCEDURE sp_CapNhatThongTinCaNhan
  @p_id INT,
  @p_ho_ten NVARCHAR(255),
  @p_cho_thuong_tru NVARCHAR(255),
  @p_que_quan NVARCHAR(255),
  @p_nam_sinh INT,
  @p_mat_khau NVARCHAR(255)
AS
BEGIN
  UPDATE TaiKhoan
  SET ho_ten = @p_ho_ten,
      cho_thuong_tru = @p_cho_thuong_tru,
      que_quan = @p_que_quan,
      nam_sinh = @p_nam_sinh,
      mat_khau = COALESCE(NULLIF(@p_mat_khau, ''), mat_khau)
  WHERE tai_khoan_id = @p_id;
END;
GO

-- Trigger khi thêm phản ánh (Lưu ý: SQL Server Trigger chạy trên toàn bộ tập thao tác, không phải từng Row)
CREATE TRIGGER trg_after_insert_phananh
ON PhanAnh
AFTER INSERT
AS
BEGIN
  INSERT INTO NhatKy (ngay_gio, hanh_dong, nguoi_thuc_hien, phan_anh_id, tham_chieu)
  SELECT GETDATE(), N'Tạo phản ánh mới', N'Hệ thống', phan_anh_id, tieu_de
  FROM inserted;
END;
GO

-- Trigger khi update phản ánh
CREATE TRIGGER trg_after_update_phananh
ON PhanAnh
AFTER UPDATE
AS
BEGIN
  INSERT INTO NhatKy (ngay_gio, hanh_dong, nguoi_thuc_hien, phan_anh_id, tham_chieu)
  SELECT GETDATE(), N'Cập nhật phản ánh', N'Hệ thống', phan_anh_id, tieu_de
  FROM inserted;
END;
GO
