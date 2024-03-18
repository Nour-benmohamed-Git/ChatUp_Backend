import { Request, Response } from 'express';
import { FriendRequestService } from '../services/FriendRequestService';

export class FriendRequestController {
  private friendRequestService: FriendRequestService;

  constructor() {
    this.friendRequestService = new FriendRequestService();
  }

  getOwnFriendRequests = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
      const friendRequests =
        await this.friendRequestService.getOwnFriendRequests(token);
      if (friendRequests.length === 0) {
        res.json({ data: [] });
      } else {
        res.status(200).json({ data: friendRequests });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  createFriendRequest = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
      const { email } = req.body;
      const friendRequest = await this.friendRequestService.createFriendRequest(
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
    const friendRequestId = parseInt(req.params.friendRequestId);

    try {
      const updatedRequest =
        await this.friendRequestService.updateFiendRequestStatusToAccepted(
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
    const friendRequestId = parseInt(req.params.friendRequestId);
    try {
      const updatedRequest =
        await this.friendRequestService.updateFiendRequestStatusToDeclined(
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

  getUnseenFiendRequestsCount = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
      const count =
        await this.friendRequestService.getUnseenFiendRequestsCount(token);
      res.json({ data: count });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}
