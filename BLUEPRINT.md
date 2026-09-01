# BLUEPRINT.md — DCid: Hệ thống Quản lý Dân cư Thông minh

> **Phiên bản:** 2.0 | **Cập nhật:** 2026-08-29  
> **Tên dự án:** DCid – Quản Lý Phường/Xã Số  
> **Mục tiêu:** Số hóa toàn bộ quy trình quản lý dân cư, xử lý phản ánh, thông báo và hộ gia đình cho cấp phường/xã tại Việt Nam.

---

## 1. Tổng quan Kiến trúc (Architecture Overview)

Dự án sử dụng kiến trúc **Monorepo Full-Stack** – Frontend và Backend nằm chung trong một repository, chạy song song trên cùng một máy chủ.

```
┌─────────────────────────────────────────────────────────┐
│                      NGƯỜI DÙNG                         │
│          (Trình duyệt Web – Chrome, Edge, Firefox)      │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / WebSocket
                         ▼
┌─────────────────────────────────────────────────────────┐
│               NODE.JS SERVER (Port 3000)                │
│  ┌─────────────────┐   ┌───────────────────────────┐   │
│  │  Express.js API │   │  Vite Static File Server  │   │
│  │  (Backend REST) │   │  (Phục vụ React Frontend) │   │
│  └────────┬────────┘   └───────────────────────────┘   │
│           │ WebSocket (ws)                              │
│           │ Real-time Push Notification                 │
│  ┌────────▼────────┐                                    │
│  │  SQL Server DB  │  (mssql + msnodesqlv8)             │
│  │  Quanlydancu1   │                                    │
│  └─────────────────┘                                    │
└─────────────────────────────────────────────────────────┘
```

**Khởi động hệ thống:**
```bash
npm run dev    # Khởi động đồng thời Backend (port 3000) + Frontend (Vite dev server)
```

---

## 2. Công nghệ Sử dụng (Tech Stack)

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| **Frontend Framework** | React | 19.2.x |
| **Build Tool** | Vite | 8.0.x |
| **Routing** | React Router DOM | 7.x |
| **Bản đồ** | Leaflet + React-Leaflet | 1.9.x / 5.0.x |
| **Biểu đồ** | Recharts | 3.x |
| **Icon** | Lucide React | 1.16.x |
| **CSS** | Vanilla CSS (thiết kế tùy chỉnh, không dùng Tailwind) | — |
| **Backend Framework** | Node.js + Express.js | 4.18.x |
| **Cơ sở dữ liệu** | Microsoft SQL Server | — |
| **Driver DB** | mssql + msnodesqlv8 (Windows native) | 10.x / 5.x |
| **Upload File** | Multer | 2.x |
| **Real-time** | WebSocket (ws) | 8.x |
| **AI Chatbot** | Google Gemini API (`@google/generative-ai`) | 0.24.x |
| **API Docs** | Swagger UI + swagger-jsdoc | 5.x / 6.x |
| **Biến môi trường** | dotenv | 17.x |

---

## 3. Cấu trúc Thư mục (Project Structure)

```
QuanLyPhuong/
│
├── 📄 package.json          # Cấu hình npm, scripts, dependencies
├── 📄 vite.config.js        # Cấu hình Vite (proxy API → port 3000)
├── 📄 .env                  # Biến môi trường (PORT, DB, JWT, GEMINI_KEY)
├── 📄 start.js              # Script khởi động đồng thời server + vite
├── 📄 index.html            # Điểm vào HTML của React App
│
├── 📁 server/               # ═══ BACKEND (Node.js + Express) ═══
│   ├── index.js             # Entry point: khởi động server + WebSocket
│   ├── app.js               # Cấu hình Express, Swagger, routes
│   ├── 📁 config/
│   │   ├── database.js      # Quản lý connection pool SQL Server
│   │   └── db.config.js     # Hàm connectDB() khởi động kết nối
│   ├── 📁 models/           # Tầng truy cập dữ liệu (Data Access Layer)
│   │   ├── TaiKhoan.model.js    # CRUD tài khoản người dùng
│   │   ├── PhanAnh.model.js     # CRUD phản ánh sự cố
│   │   ├── HoGiaDinh.model.js   # CRUD hộ gia đình
│   │   └── ThongBao.model.js    # CRUD thông báo
│   ├── 📁 controllers/      # Tầng xử lý nghiệp vụ (Business Logic)
│   │   ├── auth.controller.js       # Đăng nhập, đăng ký, OTP, quản lý user
│   │   ├── report.controller.js     # Xử lý phản ánh + upload file
│   │   ├── announcement.controller.js # CRUD thông báo
│   │   ├── hogiadinh.controller.js  # CRUD hộ gia đình
│   │   └── chat.controller.js       # Gọi Gemini AI API
│   ├── 📁 routes/           # Định nghĩa URL Endpoints
│   │   ├── auth.routes.js       # /api/login, /api/register, /api/admin/...
│   │   ├── report.routes.js     # /api/reports, /api/upload
│   │   ├── announcement.routes.js # /api/announcements
│   │   └── hogiadinh.routes.js  # /api/hogiadinh
│   ├── 📁 middlewares/      # Auth middleware (JWT verify)
│   └── 📁 db/               # SQL schema migration files
│
├── 📁 src/                  # ═══ FRONTEND (React + Vite) ═══
│   ├── main.jsx             # Điểm vào React, mount <App />
│   ├── App.jsx              # Router chính, PrivateRoute, layout
│   ├── index.css            # Bộ thiết kế toàn cục (CSS Variables, utilities)
│   │
│   ├── 📁 context/
│   │   └── AuthContext.jsx  # Global State: thông tin user, login/logout
│   │
│   ├── 📁 pages/            # Các trang chính của từng vai trò
│   │   ├── Login.jsx             # Trang đăng nhập
│   │   ├── Register.jsx          # Trang đăng ký tài khoản Công dân
│   │   ├── ForgotPassword.jsx    # Trang quên mật khẩu (OTP flow)
│   │   ├── CitizenPortal.jsx     # Cổng thông tin Công dân (report, HGD, chatbot...)
│   │   ├── OfficialDashboard.jsx # Bảng điều khiển Cán bộ Thôn
│   │   ├── OfficeDashboard.jsx   # Bảng điều khiển Văn phòng Xã
│   │   ├── AdminDashboard.jsx    # Bảng điều khiển Chủ tịch Xã
│   │   ├── SystemAdmin.jsx       # Trang Quản trị Hệ thống (superadmin)
│   │   └── ProfileSettings.jsx   # Trang cài đặt hồ sơ cá nhân
│   │
│   ├── 📁 components/       # Các thành phần UI tái sử dụng
│   │   ├── Sidebar.jsx           # Menu điều hướng bên trái (theo vai trò)
│   │   ├── Topbar.jsx            # Thanh tiêu đề trên (chào hỏi, chuông thông báo)
│   │   ├── AnnouncementManager.jsx # Quản lý thông báo (modal CRUD)
│   │   ├── MapDashboard.jsx      # Bản đồ sự cố (Leaflet)
│   │   └── Chatbot.jsx           # Trợ lý AI (nổi, kéo được)
│   │
│   ├── 📁 controllers/      # Custom Hooks (tách business logic khỏi View)
│   │   ├── useAuth.js            # Hooks xác thực (login API)
│   │   ├── useReports.js         # Quản lý phản ánh + WebSocket real-time
│   │   ├── useAnnouncements.js   # CRUD thông báo
│   │   ├── useHoGiaDinh.js       # CRUD hộ gia đình
│   │   ├── useOfficialNotifications.js # Thống kê phản ánh mới cho cán bộ
│   │   ├── useResidents.js       # Quản lý cư dân
│   │   └── useChat.js            # Logic hội thoại AI Chatbot
│   │
│   ├── 📁 services/
│   │   └── api.js           # Tất cả hàm gọi REST API (fetch wrapper)
│   │
│   └── 📁 utils/
│       └── localDatabase.js # Hàm getFilteredByArea() lọc dữ liệu theo khu vực
│
└── 📁 uploads/              # Thư mục lưu file ảnh/video tải lên (server-side)
```

---

## 4. Hệ thống Vai trò & Phân quyền (Roles & Permissions)

Hệ thống có **5 vai trò** được quản lý qua trường `vai_tro` trong bảng `TaiKhoan` của SQL Server. Mỗi vai trò được redirect đến một trang riêng biệt.

| Vai trò (code) | Tên hiển thị | URL | Mô tả |
|---|---|---|---|
| `citizen` | Công dân | `/citizen` | Gửi phản ánh, khai báo HGĐ, xem thông báo, chat AI |
| `official` | Cán bộ Thôn | `/official` | Tiếp nhận & xử lý phản ánh trong thôn, đăng thông báo, bản đồ |
| `office` | Văn phòng Xã | `/office` | Tiếp nhận phản ánh toàn xã, đăng thông báo, bản đồ |
| `admin` | Chủ tịch Xã | `/admin` | Tổng hợp toàn bộ phản ánh + thống kê + thông báo |
| `superadmin` | Quản trị Hệ thống | `/system-admin` | Quản lý toàn bộ tài khoản, đổi vai trò, xóa user |

**Cơ chế bảo vệ route:** Component `<PrivateRoute allowedRoles={[...]}>` trong `App.jsx` kiểm tra `user.role` từ `AuthContext`. Nếu sai vai trò → redirect về trang phù hợp.

---

## 5. Cơ sở Dữ liệu (Database Schema)

**Hệ quản trị:** Microsoft SQL Server  
**Database:** `Quanlydancu1`  
**Kết nối:** Windows Authentication qua `msnodesqlv8` (không cần username/password SQL)

### Các bảng chính:

#### `TaiKhoan` — Tài khoản người dùng
| Cột | Kiểu | Mô tả |
|---|---|---|
| `tai_khoan_id` | INT (PK) | ID tự tăng |
| `ten_dang_nhap` | VARCHAR | Username hoặc số điện thoại |
| `mat_khau` | VARCHAR | Mật khẩu (lưu thẳng, chưa hash) |
| `ho_ten` | NVARCHAR | Họ và tên |
| `vai_tro` | VARCHAR | `citizen` / `official` / `office` / `admin` / `superadmin` |
| `cho_thuong_tru` | NVARCHAR | Địa chỉ thường trú |
| `dien_thoai` | VARCHAR | Số điện thoại |
| `managed_area` | NVARCHAR | Khu vực quản lý (cho cán bộ thôn) |

#### `PhanAnh` — Phản ánh sự cố
| Cột | Kiểu | Mô tả |
|---|---|---|
| `phan_anh_id` | INT (PK) | ID tự tăng |
| `tieu_de` | NVARCHAR | Tiêu đề phản ánh |
| `noi_dung` | NVARCHAR | Nội dung chi tiết |
| `loai` | NVARCHAR | `normal` / `urgent` |
| `hinh_thuc` | NVARCHAR | Phản ánh / Kiến nghị / Đóng góp / Khẩn cấp |
| `khan_cap` | INT | Cờ khẩn cấp: `1` = khẩn, `0` = thường |
| `dia_chi` | NVARCHAR | Địa chỉ xảy ra sự cố |
| `khu_pho` | NVARCHAR | Thôn/khu vực |
| `trang_thai` | VARCHAR | `pending` → `verifying` → `processing` → `completed` |
| `nguoi_dan_id` | INT (FK) | Liên kết TaiKhoan |
| `ngay_gui` | DATETIME | Ngày gửi (tự động = GETDATE()) |
| `hinh_anh` | VARCHAR | Đường dẫn file ảnh/video đính kèm |
| `cong_khai` | INT | `1` = công khai, `0` = ẩn |
| `ket_qua_xu_ly` | NVARCHAR | Phản hồi của cán bộ |

#### `ThongBao` — Thông báo
| Cột | Kiểu | Mô tả |
|---|---|---|
| `thong_bao_id` | INT (PK) | ID tự tăng |
| `tieu_de` | NVARCHAR | Tiêu đề thông báo |
| `noi_dung` | NVARCHAR | Nội dung |
| `loai` | VARCHAR | `news` / `electricity` / `water` / `policy` |
| `ngay_dang` | DATETIME | Ngày đăng |

#### `HoGiaDinh` — Hộ Gia đình
| Cột | Kiểu | Mô tả |
|---|---|---|
| `ho_gia_dinh_id` | INT (PK) | ID tự tăng |
| `chu_ho_id` | INT (FK) | Liên kết TaiKhoan |
| `ten_chu_ho` | NVARCHAR | Tên chủ hộ |
| `dia_chi` | NVARCHAR | Địa chỉ nhà |
| `so_thanh_vien` | INT | Số thành viên |
| `khu_vuc` | NVARCHAR | Thôn/khu vực |
| `trang_thai` | VARCHAR | Trạng thái khai báo |

---

## 6. API Endpoints

**Base URL:** `http://localhost:3000`  
**API Docs (Swagger):** `http://localhost:3000/api-docs`

### Xác thực (Auth)
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/login` | Đăng nhập → trả về thông tin user |
| POST | `/api/register` | Đăng ký tài khoản Công dân mới |
| POST | `/api/forgot-password/request` | Yêu cầu OTP đặt lại mật khẩu |
| POST | `/api/forgot-password/verify` | Xác minh mã OTP |
| POST | `/api/forgot-password/reset` | Đặt lại mật khẩu mới |
| GET | `/api/profile/:id` | Lấy thông tin hồ sơ |
| PUT | `/api/profile/:id` | Cập nhật hồ sơ cá nhân |

### Quản trị Tài khoản (SuperAdmin)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/admin/users` | Lấy danh sách toàn bộ tài khoản |
| PUT | `/api/admin/users/:id/role` | Đổi vai trò người dùng |
| DELETE | `/api/admin/users/:id` | Xóa tài khoản |
| POST | `/api/admin/users` | Tạo tài khoản mới (admin tạo thủ công) |

### Phản ánh Sự cố (Reports)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/reports` | Lấy danh sách phản ánh (lọc theo area/citizenId) |
| POST | `/api/reports` | Tạo phản ánh mới |
| PATCH | `/api/reports/:id` | Cập nhật trạng thái xử lý |
| POST | `/api/upload` | Upload file ảnh/video (Multer, max 50MB) |

### Thông báo (Announcements)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/announcements` | Lấy danh sách thông báo |
| POST | `/api/announcements` | Đăng thông báo mới |
| PUT | `/api/announcements/:id` | Sửa thông báo |
| DELETE | `/api/announcements/:id` | Xóa thông báo |

### Hộ Gia đình (HoGiaDinh)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/hogiadinh` | Lấy danh sách hộ gia đình |
| GET | `/api/hogiadinh/me` | Lấy HGĐ của Công dân đang đăng nhập |
| POST | `/api/hogiadinh` | Khai báo hộ gia đình mới |
| PUT | `/api/hogiadinh/:id` | Cập nhật thông tin HGĐ |
| PUT | `/api/hogiadinh/:id/status` | Cập nhật trạng thái HGĐ |
| DELETE | `/api/hogiadinh/:id` | Xóa HGĐ |

### Tiện ích
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/health` | Health check — kiểm tra server còn sống |
| WebSocket | `ws://localhost:3000` | Push thông báo real-time khi có phản ánh mới |

---

## 7. Luồng Dữ liệu Chính (Key Data Flows)

### 7.1. Luồng Gửi Phản ánh Sự cố (Công dân)
```
Công dân điền form (CitizenPortal.jsx)
  → Chọn Hình thức: "🚨 Khẩn cấp" hoặc bình thường
  → handleSubmitReport() → addReport() [useReports.js]
  → POST /api/reports [api.js]
  → report.controller.js → PhanAnh.model.js
  → INSERT INTO PhanAnh (khan_cap = 1 nếu khẩn)
  → Server broadcast WebSocket: { type: 'REPORT_UPDATED' }
  → Tất cả Dashboard đang mở tự động load lại
  → Phản ánh khẩn cấp hiển thị viền đỏ + badge "Cấp bách"
```

### 7.2. Luồng Xử lý Phản ánh (Cán bộ / Văn phòng)
```
Cán bộ xem danh sách phản ánh (OfficialDashboard / OfficeDashboard)
  → Nhấn "Tiếp nhận / Xác minh / Xử lý / Hoàn tất"
  → advanceStatus() [useReports.js]
  → PATCH /api/reports/:id
  → Cập nhật trang_thai: pending → verifying → processing → completed
  
  [Tùy chọn] Cán bộ nhấn "Chuyển lên Văn phòng"
  → updateStatusDirectly(id, 'office_received')
  → Văn phòng tiếp nhận và xử lý
  → Gửi phản hồi về → Cán bộ hoàn tất
```

### 7.3. Luồng Đăng Thông báo (Cán bộ / Văn phòng / Chủ tịch)
```
Người có quyền vào tab "Đăng tải Thông báo"
  → AnnouncementManager component
  → Nhấn "+ Đăng thông báo mới" → Modal hiện ra
  → Nhập: Tiêu đề, Loại (điện/nước/tin tức/chính sách), Nội dung
  → addAnnouncement() [useAnnouncements.js]
  → POST /api/announcements
  → ThongBao.model.js → INSERT INTO ThongBao
  → Danh sách cập nhật real-time
```

### 7.4. Luồng Đăng nhập & Phân quyền
```
Người dùng nhập Username + Mật khẩu (Login.jsx)
  → POST /api/login
  → TaiKhoan.model.findByCredentials()
  → Server trả về thông tin user (id, ho_ten, vai_tro, managed_area...)
  → AuthContext.login(userData)
  → getRoleName(role) → tên chức danh tiếng Việt
  → Lưu vào localStorage + React State
  → App.jsx PrivateRoute kiểm tra role → redirect đến trang phù hợp
```

---

## 8. Thiết kế Giao diện (UI Design System)

**Triết lý:** Premium Dark/Light Hybrid, glassmorphism nhẹ, micro-animations.

### Bảng màu (CSS Variables trong `index.css`)
| Biến | Màu | Mô tả |
|---|---|---|
| `--primary` | `#2563EB` | Xanh dương chính |
| `--secondary` | `#10B981` | Xanh lá (thành công) |
| `--danger` | `#EF4444` | Đỏ (cảnh báo / khẩn cấp) |
| `--accent` | `#F59E0B` | Vàng cam (nổi bật) |
| `--dark` | `#1E293B` | Màu chữ tối |
| `--gray-600` | `#475569` | Chữ phụ |

### Màu theo Vai trò (trong Topbar)
| Vai trò | Màu hiển thị |
|---|---|
| `admin` | `#F59E0B` (vàng — Chủ tịch) |
| `official` | `#2563EB` (xanh — Cán bộ) |
| `office` | `#7C3AED` (tím — Văn phòng) |
| `citizen` | `#10B981` (xanh lá — Công dân) |

### Màu Badge Trạng thái Phản ánh
| Trạng thái | Badge class | Ý nghĩa |
|---|---|---|
| `pending` | `badge-pending` | Chờ tiếp nhận |
| `verifying` | `badge-verifying` | Đang xác minh |
| `processing` | `badge-processing` | Đang xử lý |
| `completed` | `badge-completed` | Đã hoàn tất |

---

## 9. Tính năng theo từng Vai trò

### Công dân (`/citizen`)
- ✅ **Gửi phản ánh sự cố**: Tiêu đề, hình thức (Phản ánh / Kiến nghị / Đóng góp / 🚨 Khẩn cấp), địa chỉ, mô tả, ảnh/video đính kèm, công khai/riêng tư
- ✅ **Lịch sử & phản hồi**: Xem lại các phản ánh đã gửi + kết quả xử lý
- ✅ **Khai báo hộ gia đình**: Đăng ký thành viên, địa chỉ
- ✅ **Thông báo phường**: Xem tin tức, lịch cúp điện/nước, chính sách mới
- ✅ **Hỏi đáp Trợ lý AI**: Chatbot Gemini hỗ trợ thủ tục hành chính
- ✅ **Liên kết Dịch vụ công**: Truy cập nhanh cổng dịch vụ công quốc gia

### Cán bộ Thôn (`/official`)
- ✅ **Danh sách phản ánh**: Lọc theo khu vực quản lý (`managed_area`), phản ánh khẩn hiển thị đỏ
- ✅ **Xử lý phản ánh**: Tiếp nhận → Xác minh → Xử lý → Hoàn tất (4 bước)
- ✅ **Chuyển tiếp lên Văn phòng**: Nếu vượt thẩm quyền
- ✅ **Đăng tải thông báo**: Thêm/Sửa/Xóa thông báo cho địa bàn
- ✅ **Bản đồ sự cố**: Xem phân bố phản ánh trên bản đồ Leaflet
- ✅ **Quản lý Hộ Gia đình**: Xem, duyệt khai báo HGĐ trong khu vực
- ✅ **Chuông thông báo real-time**: Badge đỏ khi có phản ánh mới

### Văn phòng Xã (`/office`)
- ✅ **Danh sách phản ánh toàn xã**: Không bị giới hạn `managed_area`
- ✅ **Tiếp nhận từ Cán bộ**: Xử lý các phản ánh được chuyển lên
- ✅ **Gửi kết quả về Cán bộ**: Sau xử lý, thông báo cho cán bộ thôn hoàn tất
- ✅ **Đăng tải thông báo**: Thêm/Sửa/Xóa thông báo cấp xã
- ✅ **Bản đồ sự cố**: Xem toàn bộ sự cố trên bản đồ

### Chủ tịch Xã (`/admin`)
- ✅ **Tổng hợp toàn bộ phản ánh**: Không lọc khu vực — thấy tất cả
- ✅ **Bản đồ tổng thể**: Xem phân bố sự cố toàn xã
- ✅ **Thống kê báo cáo**: Biểu đồ tình trạng phản ánh
- ✅ **Lịch họp giao ban**: Quản lý lịch họp nội bộ
- ✅ **Đăng tải thông báo**: Đăng thông báo chỉ đạo cấp xã

### Quản trị Hệ thống (`/system-admin`)
- ✅ **Quản lý tài khoản**: Xem toàn bộ user, tạo/xóa/sửa
- ✅ **Đổi vai trò**: Gán vai trò cho người dùng (citizen/official/office/admin)
- ✅ **Gán khu vực**: Cấu hình `managed_area` cho Cán bộ Thôn

---

## 10. Cấu hình Môi trường (Environment Variables)

Tạo file `.env` ở thư mục gốc:

```env
# SERVER
PORT=3000

# JWT
JWT_SECRET=your_secret_key_here

# SQL SERVER
DB_SERVER=localhost
DB_NAME=Quanlydancu1
DB_USER=dcid_user
DB_PASSWORD=yourpassword

# FRONTEND (Vite proxy)
VITE_API_BASE=http://localhost:3000

# GEMINI AI
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Lưu ý:** Dự án dùng **Windows Authentication** qua `msnodesqlv8`, nên DB_USER/DB_PASSWORD có thể để trống nếu SQL Server được cấu hình dùng Windows Auth.

---

## 11. Hướng dẫn Cài đặt & Chạy

```bash
# 1. Clone repository
git clone <repo-url>
cd QuanLyPhuong

# 2. Cài dependencies
npm install

# 3. Tạo file .env (xem mục 10)
cp .env.example .env

# 4. Khởi tạo SQL Server database (chạy file SQL schema)
# Import file: backend/db/QuanLyDanCu.sql vào SQL Server Management Studio

# 5. Chạy ứng dụng (Backend + Frontend song song)
npm run dev

# → Backend API: http://localhost:3000
# → Frontend UI: http://localhost:5173 (Vite dev) hoặc http://localhost:3000 (production)
# → API Docs:    http://localhost:3000/api-docs
```

---

## 12. Định hướng Mở rộng (Roadmap)

| Tính năng | Mức độ ưu tiên | Ghi chú |
|---|---|---|
| **Hash mật khẩu (bcrypt)** | 🔴 Cao | Hiện đang lưu plain text — rủi ro bảo mật |
| **JWT Authentication thực** | 🔴 Cao | Middleware `verifyToken` đã có, cần áp dụng toàn bộ route |
| **OTP SMS thực** | 🟡 Trung bình | Kết nối Twilio hoặc Viettel SMS API |
| **Phân trang API (Pagination)** | 🟡 Trung bình | Khi dữ liệu phản ánh lớn |
| **Push Notification (FCM)** | 🟡 Trung bình | Thay WebSocket bằng Firebase Cloud Messaging |
| **Báo cáo thống kê nâng cao** | 🟢 Thấp | Biểu đồ Recharts chi tiết hơn cho admin |
| **App Mobile** | 🟢 Thấp | React Native với code-sharing từ hooks |
| **Tích hợp bản đồ tọa độ GPS** | 🟢 Thấp | Công dân ghim vị trí sự cố trên bản đồ khi gửi |
| **Nâng cấp lên PostgreSQL** | 🟢 Thấp | Khi cần scale — thay driver trong `server/models` |
| **AI phân loại phản ánh tự động** | 🟢 Thấp | Dùng Gemini để tự phân loại/gợi ý xử lý |

---

*Blueprint được tạo tự động dựa trên phân tích toàn bộ mã nguồn dự án. Cập nhật lần cuối: 2026-08-29.*
