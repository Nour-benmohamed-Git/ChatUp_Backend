import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';

export class AuthController {
  private authService: AuthService;
  private userService: UserService;

  constructor() {
    this.authService = new AuthService();
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    const {
      email,
      password,
      username,
      firstName,
      lastName,
      phone,
      profileInfo,
    } = req.body;

    try {
      const existingUserByEmail = await this.userService.findUserByEmail(email);
      const existingUserByUsername =
        await this.userService.findUserByUsername(username);

      if (existingUserByEmail || existingUserByUsername) {
        res.status(409).json({
          error: 'User already exists with the provided email or username',
        });
        return;
      }
      const newUser = await this.authService.register({
        email,
        password,
        username,
        firstName,
        lastName,
        phone,
        profileInfo,
      });
      res.status(201).json({ data: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
      const user = await this.authService.login(email, password);
      if (user) {
        res.json({ data: user });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
      const user = await this.authService.getCurrentUser(token);
      if (user) {
        res.json({ data: user });
      } else {
        res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  updateCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    const updatedUserData = req.body;
    const profilePicture = req?.file?.filename;
    try {
      const user = await this.authService.updateCurrentUser(token, {
        ...updatedUserData,
        profilePicture,
      });
      if (user) {
        res.json({ data: user });
      } else {
        res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  addOwnFriend = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
      const userId = Number.parseInt(req.params.id, 10);
      const { friendId } = req.body;
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      const user = await this.authService.addOwnFriend(token, friendId);
      if (user) {
        res.json({ data: user });
      } else {
        res.status(404).json({ error: 'User or friend not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  removeOwnFriend = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
      const userId = Number.parseInt(req.params.id, 10);
      const { friendIdentifier } = req.body;
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      const user = await this.authService.addOwnFriend(token, friendIdentifier);
      if (user) {
        res.json({ data: user });
      } else {
        res.status(404).json({ error: 'User or friend not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  getOwnFriends = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    try {
      const { friends, total } = await this.authService.getOwnFriends(
        token,
        offset,
        Number(limit),
        String(search)
      );
      if (friends.length === 0) {
        res.json({ data: [] });
      } else {
        res.json({ data: friends, total: total });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}
