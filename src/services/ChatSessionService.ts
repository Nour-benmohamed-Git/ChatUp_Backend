import { ChatSessionDAO } from '../dao/ChatSessionDAO';
import { MessageDAO } from '../dao/MessageDAO';
import { UserDAO } from '../dao/UserDAO';
import { ChatSessionDTO } from '../dto/ChatSessionDTO';
import { ChatSession } from '../models/ChatSession';
import { getUserIdFromToken } from '../utils/helpers/jwtHepers';

export class ChatSessionService {
  private chatSessionDAO: ChatSessionDAO;
  private userDAO: UserDAO;
  private messageDAO: MessageDAO;

  constructor() {
    this.chatSessionDAO = new ChatSessionDAO();
    this.userDAO = new UserDAO();
    this.messageDAO = new MessageDAO();
  }

  async getChatSessions(): Promise<ChatSessionDTO[]> {
    const chatSessions = await this.chatSessionDAO.getChatSessions();
    const chatSessionDTOs = await Promise.all(
      chatSessions.map((chatSession) => this.mapChatSessionToDTO(chatSession))
    );
    return chatSessionDTOs;
  }

  async getChatSession(id: number): Promise<ChatSessionDTO | null> {
    const chatSession = await this.chatSessionDAO.getChatSession(id);
    if (chatSession) {
      const chatSessionDTO = await this.mapChatSessionToDTO(chatSession);
      return chatSessionDTO;
    }
    return null;
  }

  async getCurrentUserChatSessions(token: string): Promise<ChatSessionDTO[]> {
    const userId = getUserIdFromToken(token);
    const chatSessions =
      await this.chatSessionDAO.getChatSessionsByUserId(userId);
    const chatSessionDTOs = await Promise.all(
      chatSessions.map((chatSession) => this.mapChatSessionToDTO(chatSession))
    );
    return chatSessionDTOs;
  }

  async getChatSessionsByParticipants(
    secondMemberId: number,
    token: string
  ): Promise<ChatSessionDTO | null> {
    const userId = getUserIdFromToken(token);
    const currentUser = await this.userDAO.getUser(userId);
    const secondMember = await this.userDAO.getUser(secondMemberId);
    const chatSession = await this.chatSessionDAO.getChatSessionsByParticipants(
      [userId, secondMemberId]
    );
    if (chatSession) {
      return await this.mapChatSessionToDTO({
        ...chatSession,
        participants: [currentUser, secondMember],
      });
    }
    return null;
  }

  async createChatSession(
    secondMemberId: number,
    token: string
  ): Promise<ChatSessionDTO | null> {
    const userId = getUserIdFromToken(token);
    try {
      const currentUser = await this.userDAO.getUser(userId);
      const secondMember = await this.userDAO.getUser(secondMemberId);

      if (!currentUser || !secondMember) {
        console.error('Invalid user(s) in createChatSession:', {
          currentUser,
          secondMember,
        });
        return null;
      }

      const createdChatSession = await this.chatSessionDAO.createChatSession({
        participants: [currentUser, secondMember],
      });

      if (!createdChatSession) {
        console.error('Failed to create chat session');
        return null;
      }

      return this.mapChatSessionToDTO(createdChatSession);
    } catch (error) {
      console.error('Error in createChatSession:', error);
      return null;
    }
  }
  async updateChatSession(
    id: number,
    chatSessionData: Partial<ChatSessionDTO>
  ): Promise<ChatSessionDTO | null> {
    const updatedChatSession = await this.chatSessionDAO.updateChatSession(
      id,
      chatSessionData
    );
    if (updatedChatSession) {
      return await this.mapChatSessionToDTO(updatedChatSession);
    }
    return null;
  }

  async deleteChatSession(id: number): Promise<ChatSessionDTO | null> {
    const deletedChatSession = await this.chatSessionDAO.deleteChatSession(id);
    if (deletedChatSession) {
      return await this.mapChatSessionToDTO(deletedChatSession);
    }

    return null;
  }
  private async mapChatSessionToDTO(
    chatSession: Partial<ChatSession>
  ): Promise<ChatSessionDTO> {
    const lastMessage = await this.messageDAO.getChatSessionLastMessage(
      chatSession.id
    );
    return {
      id: chatSession.id,
      title: chatSession.title,
      participantsData: chatSession.participants.reduce(
        (acc, participant) => {
          acc[participant.id] = participant.username;
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
    };
  }
}
