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
import { Group } from './Group';
import { User } from './User';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({ type: 'bigint' })
  timestamp: number;

  @Column({ default: false })
  edited: boolean;

  @Column({ default: false })
  readStatus: boolean;

  @Column('simple-array', { nullable: true })
  deletedBy: number[];

  @ManyToOne(() => User, (user) => user.sentMessages)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  // Optional: Reference to the receiver user if it's a direct message
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'receiverId' })
  receiver?: User;

  // Reference to the group if it's a group message
  @ManyToOne(() => Group, (group) => group.messages, { nullable: true })
  @JoinColumn({ name: 'groupId' })
  group?: Group;

  @ManyToOne(() => ChatSession, (chatSession) => chatSession.messages, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  chatSession: ChatSession;

  @BeforeInsert()
  beforeInsert() {
    this.timestamp = toUnixTimestamp(new Date());
  }
}
