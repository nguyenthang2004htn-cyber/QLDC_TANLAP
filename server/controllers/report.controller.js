import PhanAnh from '../models/PhanAnh.model.js';
import { broadcastMessage } from '../config/websocket.js';

const reportController = {
  /**
   * GET /api/reports
   */
  async getAll(req, res, next) {
    try {
      const { area, citizenId } = req.query;
      const reports = await PhanAnh.findAll(area, citizenId);
      res.json(reports);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/reports
   */
  async create(req, res, next) {
    try {
      const { tieu_de, noi_dung, loai, dia_chi, khu_pho, nguoi_dan_id, so_dien_thoai, chuyen_muc, linh_vuc, hinh_thuc, nguon, han_xu_ly, cong_khai, don_vi_xu_ly, hinh_anh } = req.body;
      if (!tieu_de || !noi_dung || !loai || !nguoi_dan_id) {
        return res.status(400).json({ error: 'Thiếu dữ liệu phản ánh' });
      }

      const report = await PhanAnh.create({ tieu_de, noi_dung, loai, dia_chi, nguoi_dan_id, khu_pho, so_dien_thoai, chuyen_muc, linh_vuc, hinh_thuc, nguon, han_xu_ly, cong_khai, don_vi_xu_ly, hinh_anh });
      
      // Thông báo có phản ánh mới cho tất cả client
      broadcastMessage({ type: 'system_notification', action: 'REPORT_UPDATED' });
      
      res.json(report);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/reports/:id
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { trang_thai, message } = req.body;
      if (!trang_thai) {
        return res.status(400).json({ error: 'Thiếu trạng thái phản ánh' });
      }

      const result = await PhanAnh.updateStatus(id, trang_thai, message);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Không tìm thấy phản ánh' });
      }

      // Thông báo cập nhật phản ánh cho tất cả client
      broadcastMessage({ type: 'system_notification', action: 'REPORT_UPDATED' });

      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};

export default reportController;
