import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getOwnFriendRequests = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
      const friendRequests =
        await this.notificationService.getOwnFriendRequests(token);
      if (friendRequests.length === 0) {
        res.json({ data: [] });
      } else {
        res.status(200).json({ data: friendRequests });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  createNotification = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
      const { email } = req.body;
      const friendRequest = await this.notificationService.createFriendRequest(
        token,
        email
      );
      if (friendRequest) {
        res.status(201).json({ data: friendRequest });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  updateFriendRequestStatusToAccepted = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const friendRequestId = parseInt(req.params.notificationId);

    try {
      const updatedRequest =
        await this.notificationService.updateFiendRequestStatusToAccepted(
          friendRequestId
        );
      if (updatedRequest) {
        res.json({ data: updatedRequest });
      } else {
        res.status(404).json({ error: 'Friend request not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  updateFriendRequestStatusToDeclined = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const friendRequestId = parseInt(req.params.notificationId);
    try {
      const updatedRequest =
        await this.notificationService.updateFiendRequestStatusToDeclined(
          friendRequestId
        );
      if (updatedRequest) {
        res.json({ data: updatedRequest });
      } else {
        res.status(404).json({ error: 'Friend request not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}
