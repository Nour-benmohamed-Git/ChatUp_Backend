import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserDAO } from '../dao/UserDAO';
import { UserDTO } from '../dto/UserDTO';
import { getUserIdFromToken } from '../utils/helpers/jwtHepers';
import { User } from '../models/User';

export class AuthService {
  private userDAO: UserDAO;
  private secretKey: string;

  constructor() {
    this.userDAO = new UserDAO();
    this.secretKey = process.env.SECRET_KEY;
  }

  async register(userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    profileInfo: string;
  }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await this.userDAO.createUser({
      ...userData,
      password: hashedPassword,
    });
    return new UserDTO(newUser);
  }

  async login(email: string, password: string) {
    const user = await this.userDAO.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user.id }, this.secretKey, {
        expiresIn: '1d',
        algorithm: 'HS256',
      });
      return { ...new UserDTO(user), token };
    }
    return null;
  }
  async getCurrentUser(token: string) {
    const userId = getUserIdFromToken(token);
    const user = await this.userDAO.getUser(userId);
    if (user) {
      return new UserDTO(user);
    }
    return null;
  }
  async updateCurrentUser(
    token: string | undefined,
    updatedUserData: Partial<User>
  ): Promise<UserDTO> {
    const userId = getUserIdFromToken(token);
    if (!userId) {
      throw new Error('Invalid token');
    }
    const userToUpdate = await this.userDAO.getUser(userId);
    if (!userToUpdate) {
      throw new Error('User not found');
    }
    const updatedUser = await this.userDAO.updateUser(userId, updatedUserData);
    return updatedUser ? new UserDTO(updatedUser) : null;
  }
}
