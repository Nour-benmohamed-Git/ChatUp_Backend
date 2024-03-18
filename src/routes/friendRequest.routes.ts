import { Router } from 'express';
import { FriendRequestController } from '../controllers/FriendRequestController';

const friendRequestRouter = Router();
const friendRequestController = new FriendRequestController();
friendRequestRouter.get(
  '/friendRequests/own-friend-requests',
  friendRequestController.getOwnFriendRequests
);
friendRequestRouter.post(
  '/friendRequests',
  friendRequestController.createFriendRequest
);
friendRequestRouter.patch(
  '/friendRequests/:friendRequestId/accept',
  friendRequestController.updateFriendRequestStatusToAccepted
);
friendRequestRouter.patch(
  '/friendRequests/:friendRequestId/decline',
  friendRequestController.updateFriendRequestStatusToDeclined
);
friendRequestRouter.get(
  '/friendRequests/unseen-friend-requests-count',
  friendRequestController.getUnseenFiendRequestsCount
);

export default friendRequestRouter;
