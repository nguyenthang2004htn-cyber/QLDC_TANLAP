const fs = require('fs');

let initSql = fs.readFileSync('server/db/init.sql', 'utf8');

// Add dien_thoai to TaiKhoan
initSql = initSql.replace(
  /CREATE TABLE IF NOT EXISTS TaiKhoan \([\s\S]*?\);/,
  `CREATE TABLE IF NOT EXISTS TaiKhoan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ten_dang_nhap TEXT NOT NULL UNIQUE,
  dien_thoai TEXT UNIQUE,
  mat_khau TEXT NOT NULL,
  ho_ten TEXT NOT NULL,
  vai_tro TEXT NOT NULL,
  cho_thuong_tru TEXT,
  que_quan TEXT,
  nam_sinh INTEGER,
  managed_area TEXT,
  can_bo_id INTEGER,
  FOREIGN KEY (can_bo_id) REFERENCES CanBo(can_bo_id) ON DELETE SET NULL
);`
);

// Update PhanAnh foreign key
initSql = initSql.replace(
  /FOREIGN KEY \(nguoi_dan_id\) REFERENCES NguoiDan\(id\)/g,
  'FOREIGN KEY (nguoi_dan_id) REFERENCES TaiKhoan(tai_khoan_id)'
);

// Remove tables
const tablesToRemove = ['Phuong', 'KhuPho', 'NguoiDan', 'HoDan', 'ThuTuc', 'HoSoThuTuc'];
for (const table of tablesToRemove) {
  // Remove CREATE TABLE
  const createRegex = new RegExp(`CREATE TABLE IF NOT EXISTS ${table} \\([\\s\\S]*?\\);\\n?\\n?`, 'g');
  initSql = initSql.replace(createRegex, '');
  
  // Remove INSERT statements
  const insertRegex = new RegExp(`INSERT INTO ${table}[\\s\\S]*?;` + '(\\r\\n|\\n)?', 'g');
  initSql = initSql.replace(insertRegex, '');
}

// Add dien_thoai to mock accounts
initSql = initSql.replace(/('citizen1', '123', 'Nguyễn Văn A', 'citizen', '123 A', 'Bình Thuận', 1990, 'Khu phố 1', NULL)/,
                          "('citizen1', '0338404301', '123', 'Nguyễn Văn A', 'citizen', '123 A', 'Bình Thuận', 1990, 'Khu phố 1', NULL)");
initSql = initSql.replace(/('citizen2', '123', 'Trần Thị B', 'citizen', '456 B', 'Bình Thuận', 1985, 'Khu phố 2', NULL)/,
                          "('citizen2', '0912345678', '123', 'Trần Thị B', 'citizen', '456 B', 'Bình Thuận', 1985, 'Khu phố 2', NULL)");

// Fix INSERT INTO TaiKhoan schema in the mock data
initSql = initSql.replace(
  /INSERT INTO TaiKhoan \(ten_dang_nhap, mat_khau, ho_ten, vai_tro, cho_thuong_tru, que_quan, nam_sinh, managed_area, can_bo_id\)/,
  'INSERT INTO TaiKhoan (ten_dang_nhap, dien_thoai, mat_khau, ho_ten, vai_tro, cho_thuong_tru, que_quan, nam_sinh, managed_area, can_bo_id)'
);

// For admin and official mock data, just add NULL for dien_thoai
initSql = initSql.replace(/('admin', 'admin', 'Quản trị viên', 'admin', NULL, NULL, NULL, NULL, NULL)/,
                          "('admin', NULL, 'admin', 'Quản trị viên', 'admin', NULL, NULL, NULL, NULL, NULL)");
initSql = initSql.replace(/('canbo1', '123', 'Cán bộ 1', 'official', NULL, NULL, NULL, 'Khu phố 1', 1)/,
                          "('canbo1', NULL, '123', 'Cán bộ 1', 'official', NULL, NULL, NULL, 'Khu phố 1', 1)");
initSql = initSql.replace(/('canbo2', '123', 'Cán bộ 2', 'official', NULL, NULL, NULL, 'Khu phố 2', 2)/,
                          "('canbo2', NULL, '123', 'Cán bộ 2', 'official', NULL, NULL, NULL, 'Khu phố 2', 2)");

fs.writeFileSync('server/db/init.sql', initSql);
console.log('init.sql updated successfully.');
