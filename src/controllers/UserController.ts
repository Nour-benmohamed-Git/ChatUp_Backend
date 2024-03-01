import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const { users, total } = await this.userService.getUsers(
        offset,
        Number(limit),
        String(search)
      );
      if (users.length === 0) {
        res.json({ data: [] });
      } else {
        res.json({ data: users, total: total });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.getUser(
        Number.parseInt(req.params.id, 10)
      );
      if (user) {
        res.json({ data: user });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const newUser = await this.userService.createUser(req.body);
      if (!newUser) {
        res.status(400).json({ error: 'User creation failed' });
      } else {
        res.status(201).json({ data: newUser });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number.parseInt(req.params.id, 10);

      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      const profilePicture = req?.file?.filename;
      const updatedUser = await this.userService.updateUser(userId, {
        ...req.body,
        profilePicture,
      });

      if (updatedUser) {
        res.json({ data: updatedUser });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = Number.parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      const deletedUser = await this.userService.deleteUser(userId);
      if (deletedUser) {
        res.json({ data: deletedUser });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}
