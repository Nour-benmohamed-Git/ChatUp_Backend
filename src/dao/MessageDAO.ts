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
    return this.messageRepository.findOne({ where: { id: id } });
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
    });

    if (messageToDelete) {
      await this.messageRepository.remove(messageToDelete);
      return messageToDelete;
    }

    return null;
  }
}
