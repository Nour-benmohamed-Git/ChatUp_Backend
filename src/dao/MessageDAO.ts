import { Repository } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { Message } from '../models/Message';

export class MessageDAO {
  private messageRepository: Repository<Message>;

  constructor() {
    this.messageRepository = AppDataSource.getRepository(Message);
  }

  async getMessages(): Promise<Message[]> {
    return this.messageRepository.find();
  }

  async getMessage(id: number): Promise<Message | null> {
    return this.messageRepository.findOne({
      where: { id: id },
    });
  }

  async getMessagesByChatSessionId(chatSessionId: number): Promise<Message[]> {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.sender', 'sender')
      .leftJoin('message.receiver', 'receiver')
      .select([
        'message.id AS id',
        'message.content AS content',
        'message.timestamp AS timestamp',
        'message.edited AS edited',
        'message.readStatus AS readStatus',
        'sender.id AS senderId',
        'message.chatSession.id AS chatSessionId',
      ])
      .where('message.chatSession = :chatSessionId', { chatSessionId })
      .getRawMany();
    return messages;
  }

  async createMessage(messageData: Partial<Message>): Promise<Message> {
    const message = this.messageRepository.create(messageData);
    return this.messageRepository.save(message);
  }

  async updateMessage(
    id: number,
    messageData: Partial<Message>
  ): Promise<Message | null> {
    const messageToUpdate = await this.messageRepository.findOne({
      where: { id: id },
      relations: ['chatSession', 'group'],
    });
    if (messageToUpdate) {
      this.messageRepository.merge(messageToUpdate, messageData);
      return this.messageRepository.save(messageToUpdate);
    }

    return null;
  }

  async deleteMessage(id: number): Promise<Message | null> {
    const messageToDelete = await this.messageRepository.findOne({
      where: { id: id },
      relations: ['chatSession', 'group'],
    });
    if (messageToDelete) {
      await this.messageRepository.delete(id);
      return messageToDelete;
    }
    return null;
  }

  async getChatSessionLastMessage(
    chatSessionId: number
  ): Promise<Message | null> {
    return this.messageRepository.findOne({
      where: { chatSession: { id: chatSessionId } },
      order: { timestamp: 'DESC' },
    });
  }
}
