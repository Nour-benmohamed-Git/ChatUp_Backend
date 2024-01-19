import { Repository, } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { User } from '../models/User';

export class UserDAO {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id: id } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.userRepository.save(userData);
  }
}



