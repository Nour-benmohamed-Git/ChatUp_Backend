import { ChatSessionDAO } from '../dao/ChatSessionDAO';
import { NotificationDAO } from '../dao/NotificationDAO';
import { UserDAO } from '../dao/UserDAO';
import { NotificationDTO } from '../dto/NotificationDTO';
import { getUserIdFromToken } from '../utils/helpers/jwtHepers';

export class NotificationService {
  private notificationDAO: NotificationDAO;
  private userDAO: UserDAO;
  private chatSessionDAO: ChatSessionDAO;
  constructor() {
    this.notificationDAO = new NotificationDAO();
    this.userDAO = new UserDAO();
    this.chatSessionDAO = new ChatSessionDAO();
  }
  async getOwnFriendRequests(token: string): Promise<NotificationDTO[]> {
    const userId = getUserIdFromToken(token);
    return this.notificationDAO.getFriendRequestsByUserId(userId);
  }
  async createFriendRequest(
    token: string,
    friendIdentifier: string
  ): Promise<NotificationDTO | null> {
    const userId = getUserIdFromToken(token);
    try {
      const currentUser = await this.userDAO.getUser(userId);
      const secondMember = await this.userDAO.findUserByEmail(friendIdentifier);
      if (currentUser.id === secondMember.id) {
        console.error('Cannot send a friend request to yourself');
        return null;
      }
      const createdNotification =
        await this.notificationDAO.createFriendRequest({
          sender: currentUser,
          receiver: secondMember,
          title: currentUser.username,
          image: currentUser.profilePicture,
        });

      if (!createdNotification) {
        console.error('Failed to create friend request');
        return null;
      }
      return new NotificationDTO(createdNotification);
    } catch (error) {
      console.error('Error while creating a friend request', error);
      return null;
    }
  }

  async updateFiendRequestStatusToAccepted(
    id: number
  ): Promise<NotificationDTO> {
    const friendRequestData =
      await this.notificationDAO.updateFiendRequestStatusToAccepted(id);

    if (friendRequestData) {
      await this.userDAO.addFriend(
        friendRequestData.receiver.id,
        friendRequestData.sender.id
      );
      return new NotificationDTO(friendRequestData);
    }
    return null;
  }
  async updateFiendRequestStatusToDeclined(
    id: number
  ): Promise<NotificationDTO> {
    const friendRequestData =
      await this.notificationDAO.updateFiendRequestStatusToDeclined(id);
    if (friendRequestData) {
      return new NotificationDTO(friendRequestData);
    }
    return null;
  }
}
