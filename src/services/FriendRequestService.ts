import { FriendRequestDAO } from '../dao/FriendRequestDAO';
import { UserDAO } from '../dao/UserDAO';
import { FriendRequestDTO } from '../dto/FriendRequestDTO';
import { getUserIdFromToken } from '../utils/helpers/jwtHepers';

export class FriendRequestService {
  private friendRequestDAO: FriendRequestDAO;
  private userDAO: UserDAO;
  constructor() {
    this.friendRequestDAO = new FriendRequestDAO();
    this.userDAO = new UserDAO();
  }
  async getOwnFriendRequests(token: string): Promise<FriendRequestDTO[]> {
    const userId = getUserIdFromToken(token);
    const friendRequests =
      await this.friendRequestDAO.getFriendRequestsByUserId(userId);
    try {
      const friendRequestsDTO = friendRequests?.map(
        (friendRequest) => new FriendRequestDTO(friendRequest)
      );
      return friendRequestsDTO;
    } catch (error) {
      console.log(error);
    }
  }
  async createFriendRequest(
    token: string,
    friendIdentifier: string
  ): Promise<FriendRequestDTO | null> {
    const userId = getUserIdFromToken(token);
    try {
      const currentUser = await this.userDAO.getUser(userId);
      const secondMember = await this.userDAO.findUserByEmail(friendIdentifier);
      if (currentUser.id === secondMember.id) {
        console.error('Cannot send a friend request to yourself');
        return null;
      }
      const createdNotification =
        await this.friendRequestDAO.createFriendRequest({
          sender: currentUser,
          receiver: secondMember,
          title: currentUser.username,
          image: currentUser.profilePicture,
        });

      if (!createdNotification) {
        console.error('Failed to create friend request');
        return null;
      }
      return new FriendRequestDTO(createdNotification);
    } catch (error) {
      console.error('Error while creating a friend request', error);
      return null;
    }
  }

  async updateFiendRequestStatusToAccepted(
    id: number
  ): Promise<FriendRequestDTO> {
    const friendRequestData =
      await this.friendRequestDAO.updateFiendRequestStatusToAccepted(id);

    if (friendRequestData) {
      await this.userDAO.addFriend(
        friendRequestData.receiver.id,
        friendRequestData.sender.id
      );
      return new FriendRequestDTO(friendRequestData);
    }
    return null;
  }
  async updateFiendRequestStatusToDeclined(
    id: number
  ): Promise<FriendRequestDTO> {
    const friendRequestData =
      await this.friendRequestDAO.updateFiendRequestStatusToDeclined(id);
    if (friendRequestData) {
      return new FriendRequestDTO(friendRequestData);
    }
    return null;
  }
  async markFriendRequestsAsSeen(notificationIds: number[]): Promise<void> {
    await this.friendRequestDAO.markFriendRequestsAsSeen(notificationIds);
  }

  async getUnseenFiendRequestsCount(token: string): Promise<number> {
    const userId = getUserIdFromToken(token);
    return this.friendRequestDAO.getUnseenFriendRequestsCount(userId);
  }
}
