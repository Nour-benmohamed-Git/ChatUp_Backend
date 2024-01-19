import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Message } from './Message';

@Entity()
export class ChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];

  @OneToMany(() => Message, (message) => message.chatSession)
  messages: Message[];

  @CreateDateColumn()
  creationDate: Date;

  @UpdateDateColumn()
  lastActiveDate: Date;
}
