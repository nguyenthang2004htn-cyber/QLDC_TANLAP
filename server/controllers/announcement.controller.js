import ThongBao from '../models/ThongBao.model.js';

const announcementController = {
  /**
   * GET /api/announcements
   */
  async getAll(req, res, next) {
    try {
      const announcements = await ThongBao.findAll();
      res.json(announcements);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/announcements
   */
  async create(req, res, next) {
    try {
      const { tieu_de, noi_dung, loai } = req.body;
      if (!tieu_de || !noi_dung || !loai) {
        return res.status(400).json({ error: 'Thiếu dữ liệu thông báo' });
      }

      const announcement = await ThongBao.create({ tieu_de, noi_dung, loai });
      res.json(announcement);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/announcements/:id
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ThongBao.deleteById(id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Không tìm thấy thông báo' });
      }
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
  /**
   * PUT /api/announcements/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { tieu_de, noi_dung, loai } = req.body;
      if (!tieu_de || !noi_dung || !loai) {
        return res.status(400).json({ error: 'Thiếu thông tin thông báo' });
      }
      await ThongBao.updateById(id, { tieu_de, noi_dung, loai });
      res.json({ success: true, message: 'Đã cập nhật thông báo' });
    } catch (err) {
      next(err);
    }
  }
};

export default announcementController;
