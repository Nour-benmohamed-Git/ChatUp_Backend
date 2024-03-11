import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';

const notificationRouter = Router();
const notificationController = new NotificationController();
notificationRouter.get(
  '/notifications/own-friend-requests',
  notificationController.getOwnFriendRequests
);
notificationRouter.post(
  '/notifications',
  notificationController.createNotification
);
notificationRouter.patch(
  '/notifications/:notificationId/accept',
  notificationController.updateFriendRequestStatusToAccepted
);
notificationRouter.patch(
  '/notifications/:notificationId/decline',
  notificationController.updateFriendRequestStatusToDeclined
);

export default notificationRouter;
