import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Group } from './Group';
import { ChatSession } from './ChatSession';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ default: false })
  edited: boolean;

  @Column({ default: false })
  readStatus: boolean;

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

  @ManyToOne(() => ChatSession, (chatSession) => chatSession.messages)
  chatSession: ChatSession;
}
