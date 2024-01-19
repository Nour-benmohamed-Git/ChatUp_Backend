import { Repository } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { ChatSession } from '../models/ChatSession';

export class ChatSessionDAO {
  private chatSessionRepository: Repository<ChatSession>;

  constructor() {
    this.chatSessionRepository = AppDataSource.getRepository(ChatSession);
  }

  async getChatSessions(): Promise<ChatSession[]> {
    return this.chatSessionRepository.find();
  }

  async getChatSession(id: number): Promise<ChatSession | null> {
    return this.chatSessionRepository.findOne({ where: { id: id } });
  }

  async createChatSession(
    chatSessionData: Partial<ChatSession>
  ): Promise<ChatSession> {
    const chatSession = this.chatSessionRepository.create(chatSessionData);
    return this.chatSessionRepository.save(chatSession);
  }

  async updateChatSession(
    id: number,
    chatSessionData: Partial<ChatSession>
  ): Promise<ChatSession | null> {
    await this.chatSessionRepository.update({ id }, chatSessionData);
    return this.chatSessionRepository.findOne({ where: { id: id } });
  }

  async deleteChatSession(id: number): Promise<ChatSession | null> {
    const deletedChatSession = await this.chatSessionRepository.findOne({
      where: { id: id },
    });
    if (deletedChatSession) {
      await this.chatSessionRepository.delete({ id });
      return deletedChatSession;
    }
    return null;
  }
}
