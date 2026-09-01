-- Xóa các bảng cũ (nếu có) để tránh lỗi "already exists"
DROP TABLE IF EXISTS public."NhatKy" CASCADE;
DROP TABLE IF EXISTS public."HoGiaDinh" CASCADE;
DROP TABLE IF EXISTS public."PhanAnh" CASCADE;
DROP TABLE IF EXISTS public."TaiKhoan" CASCADE;
DROP TABLE IF EXISTS public."CanBo" CASCADE;
DROP TABLE IF EXISTS public."DonVi" CASCADE;
DROP TABLE IF EXISTS public."ThongBao" CASCADE;

-- Bảng Đơn Vị
CREATE TABLE public."DonVi" (
    "don_vi_id" SERIAL PRIMARY KEY,
    "ten_don_vi" TEXT NOT NULL,
    "mo_ta" TEXT
);

-- Bảng Cán Bộ
CREATE TABLE public."CanBo" (
    "can_bo_id" SERIAL PRIMARY KEY,
    "ho_ten" TEXT NOT NULL,
    "chuc_vu" TEXT,
    "dien_thoai" TEXT,
    "don_vi_id" INTEGER REFERENCES public."DonVi"("don_vi_id") ON DELETE SET NULL
);

-- Bảng Tài Khoản
CREATE TABLE public."TaiKhoan" (
    "tai_khoan_id" SERIAL PRIMARY KEY,
    "ten_dang_nhap" TEXT NOT NULL UNIQUE,
    "dien_thoai" TEXT UNIQUE,
    "mat_khau" TEXT NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "vai_tro" TEXT NOT NULL,
    "cho_thuong_tru" TEXT,
    "que_quan" TEXT,
    "nam_sinh" INTEGER,
    "managed_area" TEXT,
    "can_bo_id" INTEGER REFERENCES public."CanBo"("can_bo_id") ON DELETE SET NULL
);

-- Bảng Phản Ánh
CREATE TABLE public."PhanAnh" (
    "phan_anh_id" SERIAL PRIMARY KEY,
    "tieu_de" TEXT NOT NULL,
    "noi_dung" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "dia_chi" TEXT,
    "ngay_gui" TIMESTAMPTZ NOT NULL,
    "trang_thai" TEXT NOT NULL,
    "nguoi_dan_id" INTEGER REFERENCES public."TaiKhoan"("tai_khoan_id") ON DELETE SET NULL,
    "khu_pho" TEXT,
    "so_dien_thoai" TEXT,
    "chuyen_muc" TEXT,
    "linh_vuc" TEXT,
    "hinh_thuc" TEXT,
    "nguon" TEXT DEFAULT 'App người dân',
    "han_xu_ly" TIMESTAMPTZ,
    "cong_khai" INTEGER DEFAULT 0,
    "don_vi_xu_ly" TEXT,
    "ket_qua_xu_ly" TEXT,
    "hinh_anh" TEXT
);

-- Bảng Thông Báo
CREATE TABLE public."ThongBao" (
    "thong_bao_id" SERIAL PRIMARY KEY,
    "tieu_de" TEXT NOT NULL,
    "noi_dung" TEXT NOT NULL,
    "ngay_dang" TIMESTAMPTZ NOT NULL,
    "loai" TEXT NOT NULL
);

-- Bảng Nhật Ký (Lịch sử thao tác)
CREATE TABLE public."NhatKy" (
    "nhat_ky_id" SERIAL PRIMARY KEY,
    "ngay_gio" TIMESTAMPTZ NOT NULL,
    "hanh_dong" TEXT NOT NULL,
    "nguoi_thuc_hien" TEXT,
    "phan_anh_id" INTEGER REFERENCES public."PhanAnh"("phan_anh_id") ON DELETE SET NULL,
    "tham_chieu" TEXT
);

-- Bảng Hộ Gia Đình (Giữ lại từ backup thực tế)
CREATE TABLE public."HoGiaDinh" (
    "ho_gia_dinh_id" SERIAL PRIMARY KEY,
    "chu_ho_id" INTEGER REFERENCES public."TaiKhoan"("tai_khoan_id") ON DELETE SET NULL,
    "ten_chu_ho" TEXT NOT NULL,
    "dia_chi" TEXT NOT NULL,
    "so_thanh_vien" INTEGER DEFAULT 1,
    "khu_vuc" TEXT,
    "trang_thai" TEXT DEFAULT 'pending',
    "ghi_chu" TEXT,
    "nam_sinh" INTEGER,
    "lat" FLOAT,
    "lng" FLOAT,
    "ngay_khai_bao" TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo Index để truy vấn nhanh hơn
CREATE INDEX idx_phananh_nguoidan ON public."PhanAnh"("nguoi_dan_id");
CREATE INDEX idx_hogia_chuho ON public."HoGiaDinh"("chu_ho_id");

-- Trigger Function: Lưu Nhật Ký khi Tạo hoặc Cập nhật Phản Ánh
CREATE OR REPLACE FUNCTION log_phananh_action()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public."NhatKy" ("ngay_gio", "hanh_dong", "nguoi_thuc_hien", "phan_anh_id", "tham_chieu")
    VALUES (NOW(), 'Tạo phản ánh mới', 'Hệ thống', NEW.phan_anh_id, NEW.tieu_de);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public."NhatKy" ("ngay_gio", "hanh_dong", "nguoi_thuc_hien", "phan_anh_id", "tham_chieu")
    VALUES (NOW(), 'Cập nhật phản ánh', 'Hệ thống', NEW.phan_anh_id, NEW.tieu_de);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Gắn Trigger vào bảng Phản Ánh
CREATE TRIGGER trg_after_insert_phananh
AFTER INSERT ON public."PhanAnh"
FOR EACH ROW
EXECUTE FUNCTION log_phananh_action();

CREATE TRIGGER trg_after_update_phananh
AFTER UPDATE ON public."PhanAnh"
FOR EACH ROW
EXECUTE FUNCTION log_phananh_action();
