import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { toUnixTimestamp } from '../utils/helpers/dateHelpers';
import { DeletedChatSession } from './DeletedChatSession';
import { Message } from './Message';
import { User } from './User';

@Entity()
export class ChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];

  @OneToMany(() => Message, (message) => message.chatSession, {
    cascade: ['remove'],
  })
  messages: Message[];

  @Column({ type: 'bigint' })
  creationDate: number;

  @Column({ type: 'bigint' })
  lastActiveDate: number;

  @Column('simple-json', { nullable: true })
  unreadMessages: { [userId: number]: number[] };

  @Column({ default: false })
  seen: boolean;

  @BeforeInsert()
  beforeInsert() {
    this.creationDate = toUnixTimestamp(new Date());
    this.lastActiveDate = toUnixTimestamp(new Date());
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.lastActiveDate = toUnixTimestamp(new Date());
  }

  @OneToMany(
    () => DeletedChatSession,
    (deletedChatSession) => deletedChatSession.chatSession,
    {
      cascade: ['remove'],
    }
  )
  deletedChatSessions: DeletedChatSession[];
}
