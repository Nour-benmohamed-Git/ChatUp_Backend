import { ChatSessionDAO } from '../dao/ChatSessionDAO';
import { MessageDAO } from '../dao/MessageDAO';
import { UserDAO } from '../dao/UserDAO';
import { MessageDTO } from '../dto/MessageDTO';
import { Message } from '../models/Message';
import { getUserIdFromToken } from '../utils/helpers/jwtHepers';

export class MessageService {
  private messageDAO: MessageDAO;
  private chatSessionDAO: ChatSessionDAO;
  private userDAO: UserDAO;
  constructor() {
    this.messageDAO = new MessageDAO();
    this.chatSessionDAO = new ChatSessionDAO();
    this.userDAO = new UserDAO();
  }

  async getMessages(): Promise<MessageDTO[]> {
    const messages = await this.messageDAO.getMessages();
    return messages.map((message) => this.mapMessageToDTO(message));
  }

  async getMessage(id: number): Promise<MessageDTO | null> {
    const message = await this.messageDAO.getMessage(id);

    if (message) {
      return this.mapMessageToDTO(message);
    }

    return null;
  }

  async getMessagesByChatSessionId(
    chatSessionId: number,
    token: string
  ): Promise<Message[]> {
    const userId = getUserIdFromToken(token);
    return this.messageDAO.getMessagesByChatSessionId(chatSessionId, userId);
  }

  async createMessage(messageDTO: MessageDTO): Promise<MessageDTO> {
    const messageData = await this.mapDTOToMessage(messageDTO);
    const createdMessage = await this.messageDAO.createMessage(messageData);
    return this.mapMessageToDTO(createdMessage);
  }

  async updateMessage(id: number, content: string): Promise<MessageDTO | null> {
    const updatedMessage = await this.messageDAO.updateMessage(id, content);
    if (updatedMessage) {
      return this.mapMessageToDTO(updatedMessage);
    }
    return null;
  }

  async deleteMessage(id: number): Promise<MessageDTO | null> {
    const deletedMessage = await this.messageDAO.deleteMessage(id);
    if (deletedMessage) {
      return this.mapMessageToDTO(deletedMessage);
    }
    return null;
  }

  async softDeleteMessage(
    id: number,
    token: string
  ): Promise<MessageDTO | null> {
    const userId = getUserIdFromToken(token);
    const deletedMessage = await this.messageDAO.softDeleteMessage(id, userId);
    if (deletedMessage) {
      return this.mapMessageToDTO(deletedMessage);
    }
    return null;
  }
  async getNewestMessage(id: number): Promise<MessageDTO | null> {
    const newestMessage = await this.messageDAO.getChatSessionLastMessage(id);
    if (newestMessage) {
      return this.mapMessageToDTO(newestMessage);
    }
    return null;
  }

  async markMessageAsRead(id: number): Promise<MessageDTO | null> {
    const updatedMessage = await this.messageDAO.markMessageAsRead(id);
    if (updatedMessage) {
      return this.mapMessageToDTO(updatedMessage);
    }
    return null;
  }

  async markMessagesAsRead(messageIds: number[]): Promise<void> {
    await this.messageDAO.markMessagesAsRead(messageIds);
  }
  private mapMessageToDTO(message: Message): MessageDTO {
    return {
      id: message.id,
      content: message.content,
      timestamp: message.timestamp,
      edited: message.edited,
      readStatus: message.readStatus,
      senderId: message.sender?.id,
      receiverId: message.receiver?.id,
      chatSessionId: message?.chatSession?.id,
      groupId: message.group?.id,
    };
  }

  private async mapDTOToMessage(
    messageDTO: MessageDTO
  ): Promise<Partial<Message>> {
    const sender = await this.userDAO.getUser(messageDTO.senderId);
    const receiver = await this.userDAO.getUser(messageDTO.receiverId);
    const chatSession = await this.chatSessionDAO.getChatSession(
      messageDTO.chatSessionId
    );
    return {
      content: messageDTO.content,
      edited: messageDTO.edited,
      readStatus: messageDTO.readStatus,
      sender: sender,
      receiver: receiver,
      chatSession: chatSession,
    };
  }
}
