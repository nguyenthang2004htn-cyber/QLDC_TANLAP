import HoGiaDinh from '../models/HoGiaDinh.model.js';

const hoGiaDinhController = {
  // Người dân tạo khai báo
  async create(req, res, next) {
    try {
      const { chu_ho_id, ten_chu_ho, dia_chi, so_thanh_vien, ghi_chu, khu_vuc, nam_sinh, lat, lng } = req.body;

      if (!chu_ho_id || !ten_chu_ho || !dia_chi || !so_thanh_vien || !khu_vuc || !nam_sinh) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
      }

      const newHoGiaDinh = await HoGiaDinh.create({
        chu_ho_id,
        ten_chu_ho,
        dia_chi,
        so_thanh_vien,
        ghi_chu,
        khu_vuc,
        nam_sinh,
        lat,
        lng
      });

      res.status(201).json({
        success: true,
        message: 'Gửi khai báo hộ gia đình thành công',
        data: newHoGiaDinh
      });
    } catch (err) {
      next(err);
    }
  },

  // Người dân xem danh sách khai báo của mình
  async getMyHoGiaDinh(req, res, next) {
    try {
      const { chu_ho_id } = req.query;
      if (!chu_ho_id) {
        return res.status(400).json({ error: 'Thiếu chu_ho_id' });
      }
      const list = await HoGiaDinh.getByChuHoId(chu_ho_id);
      res.json(list);
    } catch (err) {
      next(err);
    }
  },

  // Cán bộ xem toàn bộ danh sách
  async getAll(req, res, next) {
    try {
      const { managedArea } = req.query;
      const list = await HoGiaDinh.getAll(managedArea);
      res.json(list);
    } catch (err) {
      next(err);
    }
  },

  // Cán bộ cập nhật thông tin
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { ten_chu_ho, dia_chi, so_thanh_vien, ghi_chu, nam_sinh, lat, lng } = req.body;

      const updated = await HoGiaDinh.update(id, {
        ten_chu_ho,
        dia_chi,
        so_thanh_vien,
        ghi_chu,
        nam_sinh,
        lat,
        lng
      });

      if (!updated) {
        return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
      }

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  // Cán bộ cập nhật trạng thái (duyệt/từ chối)
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { trang_thai } = req.body;

      if (!['Chờ duyệt', 'Đã duyệt', 'Từ chối'].includes(trang_thai)) {
        return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
      }

      const updated = await HoGiaDinh.updateStatus(id, trang_thai);
      
      if (!updated) {
        return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
      }

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  // Cán bộ xóa hồ sơ
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await HoGiaDinh.delete(id);
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
      }

      res.json({ success: true, message: 'Đã xóa hồ sơ hộ gia đình' });
    } catch (err) {
      next(err);
    }
  }
};

export default hoGiaDinhController;
