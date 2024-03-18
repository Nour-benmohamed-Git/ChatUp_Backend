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
      relations: ['friends'],
    });

    if (user && friend) {
      const isAlreadyFriend = user.friends.some((f) => f.id === friend.id);
      const isAlreadyFriendOfFriend = friend.friends.some(
        (f) => f.id === user.id
      );

      if (!isAlreadyFriend && !isAlreadyFriendOfFriend) {
        user.friends.push(friend);
        friend.friends.push(user);
        await this.userRepository.save(user);
        await this.userRepository.save(friend);
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
      return { friends: null, total: 0 };
    }

    let friends = user.friends;

    // Apply search filter if search string is provided
    if (search) {
      const searchQuery = search.toLowerCase(); // Convert search string to lowercase for case-insensitive search
      friends = friends.filter(
        (friend) =>
          friend.username.toLowerCase().includes(searchQuery) ||
          friend.firstName.toLowerCase().includes(searchQuery) ||
          friend.lastName.toLowerCase().includes(searchQuery)
      );
    }

    const total = friends.length;

    // Apply pagination
    const startIndex = offset;
    const endIndex = Math.min(offset + limit, total); // Ensure endIndex doesn't exceed the total number of friends
    friends = friends.slice(startIndex, endIndex);

    return { friends, total };
  }

  async removeFriend(userId: number, friendId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });

    if (user) {
      const friendIndex = user.friends.findIndex(
        (friend) => friend.id === friendId
      );
      if (friendIndex !== -1) {
        const removedFriend = user.friends.splice(friendIndex, 1)[0];
        // Remove user from the friend's friends list
        const friend = await this.userRepository.findOne({
          where: { id: friendId },
          relations: ['friends'],
        });
        if (friend) {
          const userIndex = friend.friends.findIndex((u) => u.id === userId);
          if (userIndex !== -1) {
            friend.friends.splice(userIndex, 1);
            await this.userRepository.save(friend);
          }
        }
        await this.userRepository.save(user);
        return removedFriend;
      }
    }
    return null;
  }
}
