import { MessageDAO } from '../dao/MessageDAO';
import { MessageDTO } from '../dto/MessageDTO';
import { Message } from '../models/Message';

export class MessageService {
  private messageDAO: MessageDAO;

  constructor() {
    this.messageDAO = new MessageDAO();
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

  async createMessage(messageDTO: MessageDTO): Promise<MessageDTO> {
    const messageData = this.mapDTOToMessage(messageDTO);
    const createdMessage = await this.messageDAO.createMessage(messageData);

    return this.mapMessageToDTO(createdMessage);
  }

  async updateMessage(
    id: number,
    messageDTO: MessageDTO
  ): Promise<MessageDTO | null> {
    const updatedMessage = await this.messageDAO.updateMessage(id, messageDTO);

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

  private mapMessageToDTO(message: Message): MessageDTO {
    return {
      id: message.id,
      content: message.content,
      timestamp: message.timestamp,
      edited: message.edited,
      readStatus: message.readStatus,
      senderId: message.sender.id,
      receiverId: message.receiver?.id,
      groupId: message.group?.id,
      chatSessionId: message.chatSession.id,
    };
  }

  private mapDTOToMessage(messageDTO: MessageDTO): Partial<Message> {
    return {
      content: messageDTO.content,
      edited: messageDTO.edited,
      readStatus: messageDTO.readStatus,
      // Map other properties accordingly
    };
  }
}
