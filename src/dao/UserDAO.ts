import { Like, Repository } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { User } from '../models/User';

export class UserDAO {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async getUsers(
    offset: number,
    limit: number,
    search: string
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      where: [
        { username: Like(`%${search}%`) },
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
      ],
      skip: offset,
      take: limit,
    });

    return { users, total };
  }

  async getUser(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: id } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
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

  async findUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username: username } });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email: email } });
  }

  async addFriend(userId: number, friendId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });
    const friend = await this.userRepository.findOne({
      where: { id: friendId },
    });
    if (user && friend) {
      const isAlreadyFriend = user.friends.some((f) => f.id === friend.id);
      if (!isAlreadyFriend) {
        user.friends.push(friend);
        await this.userRepository.save(user);
      }
      return user;
    }
    return null;
  }

  async getFriends(
    userId: number,
    offset: number,
    limit: number,
    search: string
  ): Promise<{ friends: User[] | null; total: number }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });

    if (!user) {
      return null;
    }

    let friends = user.friends;

    // Apply search filter
    if (search) {
      friends = friends.filter(
        (friend) =>
          friend.username.includes(search) ||
          friend.firstName.includes(search) ||
          friend.lastName.includes(search)
      );
    }

    const total = friends.length;

    // Apply pagination
    const startIndex = offset;
    const endIndex = offset + limit;
    friends = friends.slice(startIndex, endIndex);
    return { friends, total };
  }

  async removeFriend(userId: number, friendId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });
    if (user) {
      user.friends = user.friends.filter((friend) => friend.id !== friendId);
      await this.userRepository.save(user);
      return user;
    }
    return null;
  }
}
