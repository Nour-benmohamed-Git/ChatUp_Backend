import { Repository } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { User } from '../models/User';

export class UserDAO {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUser(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: id } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async updateUser(
    id: number,
    userData: Partial<User>
  ): Promise<User | null> {
    const userToUpdate = await this.userRepository.findOne({
      where: { id: id },
    });

    if (userToUpdate) {
      this.userRepository.merge(userToUpdate, userData);
      return this.userRepository.save(userToUpdate);
    }

    return null;
  }

  async deleteUser(id: number): Promise<User | null> {
    const userToDelete = await this.userRepository.findOne({
      where: { id: id },
    });

    if (userToDelete) {
      await this.userRepository.remove(userToDelete);
      return userToDelete;
    }

    return null;
  }
}
