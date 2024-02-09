import { Repository } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { DeletedChatSession } from '../models/DeletedChatSession';

export class DeletedChatSessionDAO {
  private deletedChatSessionRepository: Repository<DeletedChatSession>;

  constructor() {
    this.deletedChatSessionRepository =
      AppDataSource.getRepository(DeletedChatSession);
  }

  async findDeletedChatSessionByCurrentUserIdAndChatSessionId(
    userId: number,
    chatSessionId: number
  ): Promise<DeletedChatSession | null> {
    try {
      const deletedChatSession =
        await this.deletedChatSessionRepository.findOne({
          where: {
            user: { id: userId },
            chatSession: { id: chatSessionId },
          },
          relations: ['user', 'chatSession'], // Optional: Include relations if needed
        });
      return deletedChatSession || null;
    } catch (error) {
      console.error('Error finding deleted chat session:', error);
      throw error;
    }
  }

  async getDeletedChatSessionCountByChatSessionId(
    chatSessionId: number
  ): Promise<number> {
    try {
      const count = await this.deletedChatSessionRepository.count({
        where: {
          chatSession: { id: chatSessionId },
        },
      });
      return count;
    } catch (error) {
      console.error('Error counting deleted chat sessions:', error);
      throw error;
    }
  }

  async deleteDeletedChatSession(id: number): Promise<DeletedChatSession> {
    const chatSession = await this.deletedChatSessionRepository.findOne({
      where: { id: id },
    });

    if (chatSession) {
      await this.deletedChatSessionRepository.delete(id);
      return chatSession;
    }
    return null;
  }
}
