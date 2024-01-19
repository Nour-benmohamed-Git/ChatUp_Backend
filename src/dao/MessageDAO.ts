import { Repository } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { Message } from '../models/Message';

export class MessageDAO {
  private messageRepository: Repository<Message>;

  constructor() {
    this.messageRepository =  AppDataSource.getRepository(Message);
  }

  async getMessageById(id: number): Promise<Message | undefined> {
    return this.messageRepository.findOne({ where: { id: id } });
  }

  async createMessage(messageData: Partial<Message>): Promise<Message> {
    const message = this.messageRepository.create(messageData);
    return this.messageRepository.save(message);
  }

  // Add other methods like updateMessage, deleteMessage, etc.
}