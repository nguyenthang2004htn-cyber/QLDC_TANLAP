import express from 'express';
import hoGiaDinhController from '../controllers/hogiadinh.controller.js';

const router = express.Router();

router.post('/api/hogiadinh', hoGiaDinhController.create);
router.get('/api/hogiadinh/me', hoGiaDinhController.getMyHoGiaDinh);
router.get('/api/hogiadinh', hoGiaDinhController.getAll);
router.put('/api/hogiadinh/:id', hoGiaDinhController.update);
router.put('/api/hogiadinh/:id/status', hoGiaDinhController.updateStatus);
router.delete('/api/hogiadinh/:id', hoGiaDinhController.delete);

export default router;
