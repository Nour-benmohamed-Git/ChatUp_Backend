import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getUsers();
      if (users.length === 0) {
        res.status(404).json({ error: 'No users found' });
      } else {
        res.json({ data: users });
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
      const updatedUser = await this.userService.updateUser(userId, req.body);

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
