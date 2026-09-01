import { Router } from 'express';
import announcementController from '../controllers/announcement.controller.js';

const router = Router();

router.get('/api/announcements', announcementController.getAll);
router.post('/api/announcements', announcementController.create);
router.put('/api/announcements/:id', announcementController.update);
router.delete('/api/announcements/:id', announcementController.remove);

export default router;
