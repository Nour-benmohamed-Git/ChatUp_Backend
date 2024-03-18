import { ChatSessionDAO } from '../dao/ChatSessionDAO';
import { DeletedChatSessionDAO } from '../dao/DeletedChatSessionDAO';
import { MessageDAO } from '../dao/MessageDAO';
import { UserDAO } from '../dao/UserDAO';
import { ChatSessionDTO } from '../dto/ChatSessionDTO';
import { ChatSession } from '../models/ChatSession';
import {
  getChatSessionImage,
  getChatSessionTitle,
} from '../utils/helpers/globalHelpers';
import { getUserIdFromToken } from '../utils/helpers/jwtHepers';

export class ChatSessionService {
  private chatSessionDAO: ChatSessionDAO;
  private userDAO: UserDAO;
  private messageDAO: MessageDAO;
  private deletedChatSessionDAO: DeletedChatSessionDAO;

  constructor() {
    this.chatSessionDAO = new ChatSessionDAO();
    this.userDAO = new UserDAO();
    this.messageDAO = new MessageDAO();
    this.deletedChatSessionDAO = new DeletedChatSessionDAO();
  }
  async getChatSession(
    id: number,
    currentUserId: number
  ): Promise<ChatSessionDTO | null> {
    try {
      const chatSession = await this.chatSessionDAO.getChatSession(id);
      return this.mapChatSessionToDTO(chatSession, currentUserId);
    } catch (error) {
      console.error('Error in getChatSession:', error);
      return null;
    }
  }
  async getCurrentUserChatSessions(
    token: string,
    offset: number,
    limit: number,
    search: string
  ): Promise<{ chatSessions: ChatSessionDTO[]; total: number }> {
    const userId = getUserIdFromToken(token);
    const { chatSessions, total } =
      await this.chatSessionDAO.getChatSessionsByUserId(
        userId,
        offset,
        limit,
        search
      );
    const chatSessionDTOs = await Promise.all(
      chatSessions.map((chatSession) =>
        this.mapChatSessionToDTO(chatSession, userId)
      )
    );
    return { chatSessions: chatSessionDTOs, total };
  }

  async getChatSessionByParticipants(
    secondMemberId: number,
    token: string
  ): Promise<ChatSessionDTO | null> {
    const userId = getUserIdFromToken(token);
    const currentUser = await this.userDAO.getUser(userId);
    const secondMember = await this.userDAO.getUser(secondMemberId);
    let chatSession;
    if (userId === secondMemberId) {
      chatSession = await this.chatSessionDAO.getChatSessionByParticipants([
        userId,
      ]);
      if (chatSession) {
        return await this.mapChatSessionToDTO(
          {
            ...chatSession,
            participants: [currentUser],
          },
          userId
        );
      }
    } else {
      chatSession = await this.chatSessionDAO.getChatSessionByParticipants([
        userId,
        secondMemberId,
      ]);
      if (chatSession) {
        return await this.mapChatSessionToDTO(
          {
            ...chatSession,
            participants: [currentUser, secondMember],
          },
          userId
        );
      }
    }
    return null;
  }

  async createChatSession(
    secondMemberId: number,
    token: string
  ): Promise<ChatSessionDTO | null> {
    try {
      const userId = getUserIdFromToken(token);
      const currentUser = await this.userDAO.getUser(userId);
      const secondMember = await this.userDAO.getUser(secondMemberId);
      let createdChatSession;
      if (userId === secondMemberId) {
        createdChatSession = await this.chatSessionDAO.createChatSession({
          participants: [currentUser],
        });
      } else {
        createdChatSession = await this.chatSessionDAO.createChatSession({
          participants: [currentUser, secondMember],
        });
      }
      if (!createdChatSession) {
        console.error('Failed to create chat session');
        return null;
      }

      return this.mapChatSessionToDTO(createdChatSession, userId);
    } catch (error) {
      console.error('Error in createChatSession:', error);
      return null;
    }
  }
  async restoreChatSession(
    id: number,
    token: string
  ): Promise<ChatSessionDTO | null> {
    const userId = getUserIdFromToken(token);
    const chatSession = await this.chatSessionDAO.getChatSession(id);
    const isDeletedChatSession =
      await this.deletedChatSessionDAO.findDeletedChatSessionByCurrentUserIdAndChatSessionId(
        userId,
        chatSession.id
      );
    const isRemoved = await this.deletedChatSessionDAO.deleteDeletedChatSession(
      isDeletedChatSession.id
    );
    if (isRemoved) {
      return await this.mapChatSessionToDTO(chatSession, userId);
    }
    return null;
  }

  async deleteChatSession(
    id: number,
    token: string
  ): Promise<ChatSessionDTO | null> {
    const userId = getUserIdFromToken(token);
    const currentUser = await this.userDAO.getUser(userId);
    let deletedChatSession;
    deletedChatSession = await this.chatSessionDAO.softDeleteChatSession(
      id,
      currentUser
    );
    const count =
      await this.deletedChatSessionDAO.getDeletedChatSessionCountByChatSessionId(
        id
      );
    if (count === 2 || deletedChatSession.participants.length === 1) {
      deletedChatSession = await this.chatSessionDAO.hardDeleteChatSession(id);
    }
    if (deletedChatSession) {
      return await this.mapChatSessionToDTO(deletedChatSession, userId);
    }

    return null;
  }

  async updateUnreadMessages(
    chatSessionId: number,
    unreadMessages: { [userId: number]: number[] },
    userId: number
  ): Promise<ChatSessionDTO | null> {
    try {
      const updatedChatSession = await this.chatSessionDAO.updateUnreadMessages(
        chatSessionId,
        unreadMessages
      );
      return await this.mapChatSessionToDTO(updatedChatSession, userId);
    } catch (error) {
      console.error('Error updating unread messages:', error);
      return null;
    }
  }
  async getUnseenChatSessionCount(): Promise<number> {
    try {
      return await this.chatSessionDAO.getUnseenChatSessionCount();
    } catch (error) {
      console.error('Error getting unseen chat session count:', error);
      throw error;
    }
  }

  async markChatSessionAsSeen(
    chatSessionId: number,
    userId: number
  ): Promise<ChatSessionDTO | null> {
    try {
      const chatSession =
        await this.chatSessionDAO.markChatSessionAsSeen(chatSessionId);
      return await this.mapChatSessionToDTO(chatSession, userId);
    } catch (error) {
      console.error('Error marking chat session as seen:', error);
      throw error;
    }
  }
  private async mapChatSessionToDTO(
    chatSession: Partial<ChatSession>,
    currentUserId: number
  ): Promise<ChatSessionDTO> {
    const lastMessage = await this.messageDAO.getChatSessionLastMessage(
      chatSession.id
    );
    const isDeletedChatSession =
      await this.deletedChatSessionDAO.findDeletedChatSessionByCurrentUserIdAndChatSessionId(
        currentUserId,
        chatSession.id
      );
    return {
      id: chatSession.id,
      unreadMessages: chatSession.unreadMessages,
      seen: chatSession.seen,
      title: getChatSessionTitle(chatSession, currentUserId),
      image: getChatSessionImage(chatSession, currentUserId),
      participantsData: chatSession?.participants?.reduce(
        (acc, participant) => {
          acc[participant?.id] = participant?.username;
          return acc;
        },
        {} as { [userId: string]: string }
      ),
      creationDate: chatSession.creationDate,
      lastActiveDate: chatSession.lastActiveDate,
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            timestamp: lastMessage.timestamp,
          }
        : null,
      deletedByCurrentUser: isDeletedChatSession ? true : false,
    };
  }
}
