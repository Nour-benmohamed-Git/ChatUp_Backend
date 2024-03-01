import { UserDAO } from '../dao/UserDAO';
import { UserDTO } from '../dto/UserDTO';
import { User } from '../models/User';

export class UserService {
  private userDAO: UserDAO;

  constructor() {
    this.userDAO = new UserDAO();
  }

  async getUsers(
    offset: number,
    limit: number,
    search: string
  ): Promise<{ users: UserDTO[]; total: number }> {
    const { users, total } = await this.userDAO.getUsers(offset, limit, search);
    const usersDTO = users.map((user) => new UserDTO(user));
    return { users: usersDTO, total };
  }
  async getUser(id: number): Promise<UserDTO | null> {
    const user = await this.userDAO.getUser(id);
    return user ? new UserDTO(user) : null;
  }

  async createUser(userData: Partial<User>): Promise<UserDTO> {
    const user = await this.userDAO.createUser(userData);
    return new UserDTO(user);
  }

  async updateUser(
    id: number,
    userData: Partial<User>
  ): Promise<UserDTO | null> {
    const updatedUser = await this.userDAO.updateUser(id, userData);
    return updatedUser ? new UserDTO(updatedUser) : null;
  }

  async deleteUser(id: number): Promise<UserDTO | null> {
    const deletedUser = await this.userDAO.deleteUser(id);
    return deletedUser ? new UserDTO(deletedUser) : null;
  }

  async findUserByEmail(email: string): Promise<UserDTO | null> {
    const user = await this.userDAO.findUserByEmail(email);
    return user ? new UserDTO(user) : null;
  }

  async findUserByUsername(username: string): Promise<UserDTO | null> {
    const user = await this.userDAO.findUserByUsername(username);
    return user ? new UserDTO(user) : null;
  }
}
