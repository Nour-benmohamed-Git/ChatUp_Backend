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
}
