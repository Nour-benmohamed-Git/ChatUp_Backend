import { MessageDAO } from '../dao/MessageDAO';
import { MessageDTO } from '../dto/MessageDTO';
import { Message } from '../models/Message';

export class MessageService {
  private messageDAO: MessageDAO;

  constructor() {
    this.messageDAO = new MessageDAO();
  }

  async getMessageById(id: number): Promise<MessageDTO | undefined> {
    const message = await this.messageDAO.getMessageById(id);

    if (message) {
      return this.mapMessageToDTO(message);
    }

    return undefined;
  }

  async createMessage(messageDTO: MessageDTO): Promise<MessageDTO> {
    const messageData = this.mapDTOToMessage(messageDTO);
    const createdMessage = await this.messageDAO.createMessage(messageData);

    return this.mapMessageToDTO(createdMessage);
  }

  // Add other methods like updateMessage, deleteMessage, etc.

  // Helper method to map Message entity to MessageDTO
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

  // Helper method to map MessageDTO to Message entity
  private mapDTOToMessage(messageDTO: MessageDTO): Partial<Message> {
    return {
      content: messageDTO.content,
      edited: messageDTO.edited,
      readStatus: messageDTO.readStatus,
      // Map other properties accordingly
    };
  }
}