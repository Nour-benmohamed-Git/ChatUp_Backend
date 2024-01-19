import { Router } from "express";
import { NotificationController } from '../controllers/NotificationController';

const notificationRouter =Router();
const notificationController = new NotificationController();

notificationRouter.post('/notifications', notificationController.createNotification);
notificationRouter.get('/notifications/:id', notificationController.getNotificationById);

export default notificationRouter;