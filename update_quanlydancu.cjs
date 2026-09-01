const fs = require('fs');

let initSql = fs.readFileSync('server/db/QuanLyDanCu.sql', 'utf8');

// Add dien_thoai to TaiKhoan
initSql = initSql.replace(
  /CREATE TABLE IF NOT EXISTS TaiKhoan \([\s\S]*?\) ENGINE=InnoDB;/,
  `CREATE TABLE IF NOT EXISTS TaiKhoan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ten_dang_nhap NVARCHAR(100) NOT NULL UNIQUE,
  dien_thoai NVARCHAR(50) UNIQUE,
  mat_khau NVARCHAR(255) NOT NULL,
  ho_ten NVARCHAR(255) NOT NULL,
  vai_tro NVARCHAR(50) NOT NULL,
  cho_thuong_tru NVARCHAR(255),
  que_quan NVARCHAR(255),
  nam_sinh INT,
  khu_vuc_quan_ly NVARCHAR(100),
  can_bo_id INT,
  FOREIGN KEY (can_bo_id) REFERENCES CanBo(can_bo_id) ON DELETE SET NULL
) ENGINE=InnoDB;`
);

// Update PhanAnh foreign key
initSql = initSql.replace(
  /FOREIGN KEY \(\`nguoi_dan_id\`\) REFERENCES NguoiDan\(\`id\`\)/g,
  'FOREIGN KEY (`nguoi_dan_id`) REFERENCES TaiKhoan(`tai_khoan_id`)'
);
initSql = initSql.replace(
  /FOREIGN KEY \(nguoi_dan_id\) REFERENCES NguoiDan\(id\)/g,
  'FOREIGN KEY (nguoi_dan_id) REFERENCES TaiKhoan(tai_khoan_id)'
);

// Remove tables
const tablesToRemove = ['Phuong', 'KhuPho', 'NguoiDan', 'HoDan', 'ThuTuc', 'HoSoThuTuc'];
for (const table of tablesToRemove) {
  // Remove CREATE TABLE
  const createRegex = new RegExp(`CREATE TABLE IF NOT EXISTS ${table} \\([\\s\\S]*?\\) ENGINE=InnoDB;\\n?\\n?`, 'g');
  initSql = initSql.replace(createRegex, '');
  
  // Remove INSERT statements
  const insertRegex = new RegExp(`INSERT INTO ${table}[\\s\\S]*?;` + '(\\r\\n|\\n)?', 'g');
  initSql = initSql.replace(insertRegex, '');
}

fs.writeFileSync('server/db/QuanLyDanCu.sql', initSql);
console.log('QuanLyDanCu.sql updated successfully.');
