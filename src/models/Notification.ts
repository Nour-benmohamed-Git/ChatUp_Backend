import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Notification {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column("text")
  message: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User, user => user.notifications)
  receiver: User;

  @Column({ default: false })
  readStatus: boolean;
}