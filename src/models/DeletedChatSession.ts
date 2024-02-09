import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { toUnixTimestamp } from '../utils/helpers/dateHelpers';
import { ChatSession } from './ChatSession';
import { User } from './User';

@Entity()
export class DeletedChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.deletedChatSessions)
  @JoinColumn()
  user: User;

  @ManyToOne(
    () => ChatSession,
    (chatSession) => chatSession.deletedChatSessions,
    {
      onDelete: 'CASCADE',
      orphanedRowAction: 'delete',
    }
  )
  @JoinColumn()
  chatSession: ChatSession;

  @Column({ type: 'bigint' })
  createdAt: number;

  @BeforeInsert()
  beforeInsert() {
    this.createdAt = toUnixTimestamp(new Date());
  }
}
