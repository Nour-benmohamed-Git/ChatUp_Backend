import { UserDAO } from '../dao/UserDAO';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export class AuthService {
  private userDAO: UserDAO;

  constructor() {
    this.userDAO = new UserDAO();
  }

  async register(userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    profileInfo?: string;
  }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await this.userDAO.createUser({
      ...userData,
      password: hashedPassword,
    });
    return this.omitPassword(newUser);
  }

  async login(email: string, password: string) {
    const secretKey = process.env.SECRET_KEY;
    const user = await this.userDAO.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user.id }, secretKey, {
        expiresIn: '1h',
        algorithm: 'HS256',
      });
      return { ...this.omitPassword(user), token };
    }
    return null;
  }

  omitPassword(
    user: User
  ): Omit<User, 'password' | 'beforeInsert' | 'beforeUpdate'> {
    const { password, beforeInsert, beforeUpdate, ...userWithoutPassword } =
      user;

    return userWithoutPassword;
  }
}
