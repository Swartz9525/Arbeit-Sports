import { Router } from 'express';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../controllers/notificationController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.route('/')
  .get(getNotifications);

router.route('/:id')
  .put(markNotificationAsRead)
  .delete(deleteNotification);

export default router;
