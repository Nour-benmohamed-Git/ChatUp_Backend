import { UserDAO } from '../dao/UserDAO';
import { UserDTO } from '../dto/UserDTO';
import { User } from '../models/User';

export class UserService {
  private userDAO: UserDAO;

  constructor() {
    this.userDAO = new UserDAO();
  }

  async getUserById(id: number): Promise<UserDTO | undefined> {
    const user = await this.userDAO.getUserById(id);
    return user ? new UserDTO(user) : undefined;
  }

  async createUser(userData: Partial<User>): Promise<UserDTO> {
    const user = await this.userDAO.createUser(userData);
    return new UserDTO(user);
  }
}