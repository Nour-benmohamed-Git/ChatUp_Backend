import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';

const notificationRouter = Router();
const notificationController = new NotificationController();
notificationRouter.get(
  '/notifications',
  notificationController.getNotifications
);
notificationRouter.get(
  '/notifications/:id',
  notificationController.getNotification
);
notificationRouter.post(
  '/notifications',
  notificationController.createNotification
);
notificationRouter.put(
  '/notifications/:id',
  notificationController.updateNotification
);
notificationRouter.delete(
  '/notifications/:id',
  notificationController.deleteNotification
);

export default notificationRouter;
