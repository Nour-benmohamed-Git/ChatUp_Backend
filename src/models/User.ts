import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatSession } from './ChatSession';
import { Group } from './Group';
import { Message } from './Message';
import { Notification } from './Notification';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  userName: string;

  @Column()
  password: string; // Consider hashing passwords

  @Column({ nullable: true })
  profileInfo?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => ChatSession, (chatSession) => chatSession.participants)
  chatSessions: ChatSession[];

  @ManyToMany(() => Group, (group) => group.members)
  //specifies that a join table should be used to store the association between users and groups.
  @JoinTable()
  groups: Group[];

  @OneToMany(() => Notification, (notification) => notification.receiver)
  notifications: Notification[];
}
