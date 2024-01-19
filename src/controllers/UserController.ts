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
      res.json({ data: users });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.getUser(Number(req.params.id));
      if (user) {
        res.json({ data: user });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error in getUser:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const newUser = await this.userService.createUser(req.body);
      res.status(201).json({ data: newUser });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedUser = await this.userService.updateUser(
        Number(req.params.id),
        req.body
      );
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
      const deletedUser = await this.userService.deleteUser(
        Number(req.params.id)
      );
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
