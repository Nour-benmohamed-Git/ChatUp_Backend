import { Repository } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { ChatSession } from '../models/ChatSession';

export class ChatSessionDAO {
  private chatSessionRepository: Repository<ChatSession>;

  constructor() {
    this.chatSessionRepository =  AppDataSource.getRepository(ChatSession);
  }

  async getChatSessionById(id: number): Promise<ChatSession | undefined> {
    return this.chatSessionRepository.findOne({ where: { id: id } });
  }

  async createChatSession(chatSessionData: Partial<ChatSession>): Promise<ChatSession> {
    const chatSession = this.chatSessionRepository.create(chatSessionData);
    return this.chatSessionRepository.save(chatSession);
  }

  // Add other methods like updateChatSession, deleteChatSession, etc.
}