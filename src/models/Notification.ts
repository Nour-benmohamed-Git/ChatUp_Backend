import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { toUnixTimestamp } from '../utils/helpers/dateHelpers';
import { User } from './User';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column('text')
  message: string;

  @Column({ type: 'bigint' })
  timestamp: number;

  @ManyToOne(() => User, (user) => user.notifications)
  receiver: User;

  @Column({ default: false })
  readStatus: boolean;

  @BeforeInsert()
  beforeInsert() {
    this.timestamp = toUnixTimestamp(new Date());
  }
}
