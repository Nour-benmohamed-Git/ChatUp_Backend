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

  async getChatSessionsByUserId(userId: number): Promise<ChatSession[]> {
    return this.chatSessionRepository
      .createQueryBuilder('chatSession')
      .leftJoinAndSelect('chatSession.participants', 'participant')
      .where(
        'chatSession.id IN ' +
          '(SELECT cs.id FROM chat_session cs ' +
          'JOIN chat_session_participants_user cspu ON cs.id = cspu.chatSessionId ' +
          'WHERE cspu.userId = :userId)',
        { userId }
      )
      .getMany();
  }

  async getChatSessionsByParticipants(
    participantIds: number[]
  ): Promise<ChatSession | null> {
    const isSameParticipants = new Set(participantIds).size === 1;
    let chatSession;
    try {
      if (isSameParticipants) {
        const uniqueChatSessions = await this.chatSessionRepository
          .createQueryBuilder('chatSession')
          .innerJoin('chatSession.participants', 'participant')
          .groupBy('chatSession.id')
          .having('COUNT(participant.id) = 1')
          .getMany();

        if (uniqueChatSessions) {
          chatSession = await this.chatSessionRepository
            .createQueryBuilder('cs')
            .innerJoin('cs.participants', 'participant')
            .where('participant.id = :participantId', {
              participantId: participantIds[0],
            })
            .andWhere('cs.id IN (:...uniqueChatSessionIds)', {
              uniqueChatSessionIds: uniqueChatSessions.map(
                (session) => session.id
              ),
            })
            .getOne();
        }
      } else {
        chatSession = await this.chatSessionRepository
          .createQueryBuilder('chatSession')
          .innerJoin('chatSession.participants', 'participant')
          .where('participant.id IN (:...participantIds)', { participantIds })
          .groupBy('chatSession.id')
          .having('COUNT(DISTINCT  participant.id) = :count', {
            count: participantIds.length,
          })
          .getOne();
      }
    } catch (error) {
      // console.log('error', error);
    }
    return chatSession || null;
  }

  async createChatSession(
    chatSessionData: Partial<ChatSession>
  ): Promise<ChatSession> {
    try {
      const chatSession = this.chatSessionRepository.create(chatSessionData);
      const savedChatSession =
        await this.chatSessionRepository.save(chatSession);

      return savedChatSession;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  async updateChatSession(
    id: number,
    chatSessionData: Partial<ChatSession>
  ): Promise<ChatSession | null> {
    const chatSessionToUpdate = await this.chatSessionRepository.findOne({
      where: { id: id },
    });

    if (chatSessionToUpdate) {
      this.chatSessionRepository.merge(chatSessionToUpdate, chatSessionData);
      return this.chatSessionRepository.save(chatSessionToUpdate);
    }

    return null;
  }

  async deleteChatSession(id: number): Promise<ChatSession | null> {
    const deletedChatSession = await this.chatSessionRepository.findOne({
      where: { id: id },
    });
    if (deletedChatSession) {
      await this.chatSessionRepository.remove(deletedChatSession);
      return deletedChatSession;
    }
    return null;
  }
}
