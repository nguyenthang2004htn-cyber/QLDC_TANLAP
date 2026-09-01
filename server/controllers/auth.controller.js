import TaiKhoan from '../models/TaiKhoan.model.js';

const authController = {
  /**
   * POST /api/login
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Tên đăng nhập và mật khẩu là bắt buộc' });
      }

      const user = await TaiKhoan.findByCredentials(username, password);
      if (!user) {
        return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
      }

      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/register
   */
  async register(req, res, next) {
    try {
      const { ten_dang_nhap, mat_khau, ho_ten, cho_thuong_tru, que_quan, nam_sinh } = req.body;
      if (!ten_dang_nhap || !mat_khau || !ho_ten) {
        return res.status(400).json({ error: 'Tên đăng nhập, mật khẩu và họ tên là bắt buộc' });
      }

      // Kiểm tra tên đăng nhập đã tồn tại chưa
      const existingUser = await TaiKhoan.findByUsername(ten_dang_nhap);
      if (existingUser) {
        return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
      }

      const result = await TaiKhoan.create({ ten_dang_nhap, mat_khau, ho_ten, cho_thuong_tru, que_quan, nam_sinh });
      res.status(201).json({ success: true, message: 'Đăng ký thành công', id: result.id });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/forgot-password/request
   */
  async requestOtp(req, res, next) {
    try {
      const { username } = req.body;
      if (!username) return res.status(400).json({ error: 'Tên đăng nhập là bắt buộc' });

      const user = await TaiKhoan.findByUsername(username);
      if (!user) return res.status(404).json({ error: 'Tài khoản không tồn tại' });

      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

      global.otpStore[username] = { otp, expiresAt };

      // In real world, send via email/sms. For now, return it or log it.
      console.log(`[OTP] Generated OTP for ${username}: ${otp}`);
      res.json({ success: true, message: 'Đã gửi mã OTP', mockOtp: otp });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/forgot-password/verify
   */
  async verifyOtp(req, res, next) {
    try {
      const { username, otp } = req.body;
      if (!username || !otp) return res.status(400).json({ error: 'Thiếu thông tin' });

      const store = global.otpStore[username];
      if (!store || store.otp !== otp || Date.now() > store.expiresAt) {
        return res.status(400).json({ error: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
      }

      res.json({ success: true, message: 'Xác thực OTP thành công' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/forgot-password/reset
   */
  async resetPassword(req, res, next) {
    try {
      const { username, otp, newPassword } = req.body;
      if (!username || !otp || !newPassword) return res.status(400).json({ error: 'Thiếu thông tin' });

      const store = global.otpStore[username];
      if (!store || store.otp !== otp || Date.now() > store.expiresAt) {
        return res.status(400).json({ error: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
      }

      await TaiKhoan.updatePassword(username, newPassword);
      delete global.otpStore[username]; // Xoá OTP sau khi sử dụng

      res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/profile/:id
   */
  async getProfile(req, res, next) {
    try {
      const { id } = req.params;
      const profile = await TaiKhoan.findById(id);
      if (!profile) {
        return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
      }

      res.json(profile);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Cập nhật thông tin (bởi người dùng)
   */
  async updateProfile(req, res, next) {
    try {
      const { id } = req.params;
      const { ho_ten, mat_khau, cho_thuong_tru, que_quan, nam_sinh } = req.body;

      if (!ho_ten || !cho_thuong_tru) {
        return res.status(400).json({ error: 'Họ tên và chỗ thường trú là bắt buộc' });
      }

      await TaiKhoan.updateById(id, { ho_ten, mat_khau, cho_thuong_tru, que_quan, nam_sinh });
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * ADMIN: Lấy tất cả người dùng
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await TaiKhoan.findAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

  /**
   * ADMIN: Cập nhật vai trò người dùng
   */
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { vai_tro, managed_area } = req.body;
      
      if (!['superadmin', 'admin', 'official', 'office', 'citizen'].includes(vai_tro)) {
        return res.status(400).json({ error: 'Vai trò không hợp lệ' });
      }

      await TaiKhoan.updateRole(id, vai_tro, managed_area || null);
      res.json({ success: true, message: 'Cập nhật vai trò thành công' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * ADMIN: Xóa người dùng
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await TaiKhoan.deleteById(id);
      res.json({ success: true, message: 'Đã xóa người dùng' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * ADMIN: Tạo tài khoản mới (với vai trò chỉ định)
   */
  async createUserAdmin(req, res, next) {
    try {
      const { ten_dang_nhap, mat_khau, ho_ten, vai_tro, managed_area, cho_thuong_tru, que_quan, nam_sinh } = req.body;

      if (!ten_dang_nhap || !mat_khau || !ho_ten) {
        return res.status(400).json({ error: 'Tên đăng nhập, mật khẩu và họ tên là bắt buộc' });
      }

      if (!['citizen', 'official', 'office', 'admin'].includes(vai_tro)) {
        return res.status(400).json({ error: 'Vai trò không hợp lệ (citizen, official, office, admin)' });
      }

      // Kiểm tra username đã tồn tại chưa
      const existingUser = await TaiKhoan.findByUsername(ten_dang_nhap);
      if (existingUser) {
        return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
      }

      const newUser = await TaiKhoan.createWithRole({
        ten_dang_nhap,
        mat_khau,
        ho_ten,
        vai_tro,
        managed_area: managed_area || null,
        cho_thuong_tru: cho_thuong_tru || '',
        que_quan: que_quan || '',
        nam_sinh: nam_sinh || null
      });

      res.status(201).json({
        success: true,
        message: 'Tài khoản mới được tạo thành công',
        user: newUser
      });
    } catch (err) {
      next(err);
    }
  }
};

export default authController;
