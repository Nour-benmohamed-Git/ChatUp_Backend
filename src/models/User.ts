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
import { UserStatus } from '../utils/constants/UserStatus';
import { toUnixTimestamp } from '../utils/helpers/dateHelpers';
import { ChatSession } from './ChatSession';
import { Group } from './Group';
import { Message } from './Message';
import { Notification } from './Notification';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column()
  password: string;

  @Column({
    nullable: true,
    default: 'Hey there! I am using ChatUp made By Mr Nour.',
  })
  profileInfo?: string;

  @Column({ type: 'bigint' })
  createdAt: number;

  @Column({ type: 'bigint' })
  updatedAt: number;

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => ChatSession, (chatSession) => chatSession.participants)
  chatSessions: ChatSession[];

  @ManyToMany(() => Group, (group) => group.members)
  @JoinTable()
  groups: Group[];

  @OneToMany(() => Notification, (notification) => notification.receiver)
  notifications: Notification[];

  @BeforeInsert()
  beforeInsert() {
    this.createdAt = toUnixTimestamp(new Date());
    this.updatedAt = toUnixTimestamp(new Date());
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = toUnixTimestamp(new Date());
  }
}
