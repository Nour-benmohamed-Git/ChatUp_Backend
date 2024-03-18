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
import { UserStatus } from '../utils/constants/enums';
import { toUnixTimestamp } from '../utils/helpers/dateHelpers';
import { ChatSession } from './ChatSession';
import { DeletedChatSession } from './DeletedChatSession';
import { FriendRequest } from './FriendRequest';
import { Group } from './Group';
import { Message } from './Message';
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

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ type: 'bigint' })
  createdAt: number;

  @Column({ type: 'bigint' })
  updatedAt: number;

  @ManyToMany(() => User, (user) => user.friends)
  @JoinTable()
  friends: User[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @ManyToMany(() => ChatSession)
  chatSessions: ChatSession[];

  @ManyToMany(() => Group, (group) => group.members)
  //specifies that a join table should be used to store the association between users and groups.
  @JoinTable()
  groups: Group[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.receiver)
  friendRequests: FriendRequest[];

  @BeforeInsert()
  beforeInsert() {
    this.createdAt = toUnixTimestamp(new Date());
    this.updatedAt = toUnixTimestamp(new Date());
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = toUnixTimestamp(new Date());
  }

  @OneToMany(
    () => DeletedChatSession,
    (deletedChatSession) => deletedChatSession.user
  ) // New relationship
  deletedChatSessions: DeletedChatSession[];
}
