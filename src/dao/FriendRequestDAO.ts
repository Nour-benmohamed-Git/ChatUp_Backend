import { In, Like, Repository } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { FriendRequest } from '../models/FriendRequest';
import { FriendRequestStatus } from '../utils/constants/enums';

export class FriendRequestDAO {
  private friendRequestRepository: Repository<FriendRequest>;

  constructor() {
    this.friendRequestRepository = AppDataSource.getRepository(FriendRequest);
  }
  async getFriendRequestsByUserId(userId: number): Promise<FriendRequest[]> {
    const friendRequests = await this.friendRequestRepository.find({
      where: {
        receiver: { id: userId },
        status: Like(FriendRequestStatus.PENDING),
      },
      relations: ['sender', 'receiver'],
    });
    return friendRequests;
  }
  async createFriendRequest(
    friendRequestData: Partial<FriendRequest>
  ): Promise<FriendRequest> {
    const newFriendRequest =
      this.friendRequestRepository.create(friendRequestData);
    return this.friendRequestRepository.save(newFriendRequest);
  }
  async updateFiendRequestStatusToAccepted(id: number): Promise<FriendRequest> {
    const friendRequestToUpdate = await this.friendRequestRepository.findOne({
      where: { id: id },
      relations: ['receiver', 'sender'],
    });

    if (friendRequestToUpdate) {
      friendRequestToUpdate.status = FriendRequestStatus.ACCEPTED;
      return this.friendRequestRepository.save(friendRequestToUpdate);
    }
    return null;
  }
  async updateFiendRequestStatusToDeclined(id: number): Promise<FriendRequest> {
    const friendRequestToUpdate = await this.friendRequestRepository.findOne({
      where: { id: id },
    });
    if (friendRequestToUpdate) {
      friendRequestToUpdate.status = FriendRequestStatus.DECLINED;
      return this.friendRequestRepository.save(friendRequestToUpdate);
    }
    return null;
  }

  async markFriendRequestsAsSeen(notificationIds: number[]): Promise<void> {
    if (!notificationIds || notificationIds?.length === 0) return;
    await this.friendRequestRepository.update(
      { id: In(notificationIds) },
      { seen: true }
    );
  }

  async getUnseenFriendRequestsCount(userId: number): Promise<number> {
    return this.friendRequestRepository.count({
      where: {
        receiver: { id: userId },
        seen: false,
      },
    });
  }
}
