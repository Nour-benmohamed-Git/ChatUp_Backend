import { Repository } from 'typeorm';
import { AppDataSource } from '../configs/typeorm.config';
import { ChatSession } from '../models/ChatSession';
import { DeletedChatSession } from '../models/DeletedChatSession';
import { User } from '../models/User';

export class ChatSessionDAO {
  private chatSessionRepository: Repository<ChatSession>;
  private deletedChatSessionRepository: Repository<DeletedChatSession>;

  constructor() {
    this.chatSessionRepository = AppDataSource.getRepository(ChatSession);
    this.deletedChatSessionRepository =
      AppDataSource.getRepository(DeletedChatSession);
  }

  async getChatSessions(): Promise<ChatSession[]> {
    return this.chatSessionRepository.find();
  }

  async getChatSession(id: number): Promise<ChatSession | null> {
    return this.chatSessionRepository.findOne({
      where: { id: id },
      relations: ['participants'],
    });
  }

  async getChatSessionsByUserId(
    userId: number,
    offset: number,
    limit: number,
    search: string
  ): Promise<{ chatSessions: ChatSession[]; total: number }> {
    const [chatSessions, total] = await this.chatSessionRepository
      .createQueryBuilder('chatSession')
      .leftJoinAndSelect('chatSession.participants', 'participant')
      .leftJoin('chatSession.deletedChatSessions', 'deletedChatSession')
      .where(
        'chatSession.id IN ' +
          '(SELECT cs.id FROM chat_session cs ' +
          'JOIN chat_session_participants_user cspu ON cs.id = cspu.chatSessionId ' +
          'WHERE cspu.userId = :userId)' +
          'AND (deletedChatSession.id IS NULL OR deletedChatSession.user.id <> :userId)' + // Compare against a specific column of DeletedChatSession
          'AND (participant.username LIKE :search)', // Adding search condition
        { userId, search: `%${search}%` } // Using wildcard (%) for partial matching
      )
      .orderBy('chatSession.creationDate', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return { chatSessions, total };
  }

  // async getChatSessionsByUserId(
  //   userId: number,
  //   offset: number,
  //   limit: number,
  //   search: string
  // ): Promise<{ chatSessions: ChatSession[]; total: number }> {
  //   const queryBuilder = this.chatSessionRepository
  //     .createQueryBuilder('chatSession')
  //     .innerJoin('chatSession.participants', 'participant')
  //     .innerJoinAndSelect('chatSession.participants', 'otherParticipant')
  //     .leftJoin(
  //       'chatSession.deletedChatSessions',
  //       'deletedChatSession',
  //       'deletedChatSession.user.id <> :userId',
  //       { userId }
  //     )
  //     .where(
  //       'participant.id <> :userId AND participant.username LIKE :search',
  //       {
  //         userId,
  //         search: `%${search}%`,
  //       }
  //     );

  //   const [chatSessions, total] = await queryBuilder
  //     .skip(offset)
  //     .take(limit)
  //     .getManyAndCount();
  //   return { chatSessions, total };
  // }

  async getChatSessionByParticipants(
    participantIds: number[]
  ): Promise<ChatSession | null> {
    let chatSession;
    try {
      if (participantIds.length === 1) {
        const uniqueChatSessions = await this.chatSessionRepository
          .createQueryBuilder('chatSession')
          .innerJoin('chatSession.participants', 'participant')
          .groupBy('chatSession.id')
          .having('COUNT(participant.id) = 1')
          .getMany();

        if (uniqueChatSessions.length) {
          chatSession = await this.chatSessionRepository
            .createQueryBuilder('chatSession')
            .innerJoin('chatSession.participants', 'participant')
            .where('participant.id = :participantId', {
              participantId: participantIds[0],
            })
            .andWhere('chatSession.id IN (:...uniqueChatSessionIds)', {
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
      console.error(error);
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

  async restoreChatSession(id: number): Promise<ChatSession | null> {
    const chatSessionToUpdate = await this.chatSessionRepository.findOne({
      where: { id: id },
      relations: ['participants'],
    });
    if (chatSessionToUpdate) {
      return chatSessionToUpdate;
    }
    return null;
  }

  async softDeleteChatSession(
    id: number,
    deletedBy: User
  ): Promise<ChatSession | null> {
    const chatSessionToDelete = await this.chatSessionRepository.findOne({
      where: { id: id },
      relations: ['participants'],
    });
    if (!chatSessionToDelete) {
      return null;
    }
    const isParticipant = chatSessionToDelete.participants.some(
      (participant) => participant.id === deletedBy.id
    );
    if (!isParticipant) {
      return null;
    }

    const deletedChatSession = this.deletedChatSessionRepository.create({
      chatSession: chatSessionToDelete,
      user: deletedBy,
    });
    await this.deletedChatSessionRepository.save(deletedChatSession);
    return chatSessionToDelete;
  }

  async hardDeleteChatSession(id: number): Promise<ChatSession | null> {
    const chatSessionToDelete = await this.chatSessionRepository.findOne({
      where: { id: id },
    });
    if (chatSessionToDelete) {
      await this.chatSessionRepository.delete(id);
      return chatSessionToDelete;
    }
    return null;
  }

  async updateUnreadMessages(
    chatSessionId: number,
    unreadMessages: { [userId: number]: number[] }
  ): Promise<ChatSession | null> {
    try {
      const chatSession = await this.chatSessionRepository.findOne({
        where: { id: chatSessionId },
      });
      if (!chatSession) {
        return null;
      }

      // const updatedUnreadMessages = Object.fromEntries(
      //   Object.entries(unreadMessages).map(([userId, messages]) => [
      //     userId,
      //     messages.length,
      //   ])
      // );

      chatSession.unreadMessages = unreadMessages;

      const updatedChatSession =
        await this.chatSessionRepository.save(chatSession);
      return updatedChatSession;
    } catch (error) {
      console.error('Error updating unread messages:', error);
      throw error;
    }
  }
  async getUnseenChatSessionCount(): Promise<number> {
    try {
      const unseenChatSessions = await this.chatSessionRepository.find({
        where: { seen: false }
      });
      return unseenChatSessions.length;
    } catch (error) {
      console.error('Error fetching unseen chat sessions:', error);
      throw error;
    }
  }

  async markChatSessionAsSeen(
    chatSessionId: number
  ): Promise<ChatSession | null> {
    try {
      const chatSession = await this.chatSessionRepository.findOne({
        where: { id: chatSessionId },
      });
      if (!chatSession) {
        return null;
      }

      chatSession.seen = true;

      const updatedChatSession =
        await this.chatSessionRepository.save(chatSession);
      return updatedChatSession;
    } catch (error) {
      console.error('Error marking chat session as seen:', error);
      throw error;
    }
  }
}
