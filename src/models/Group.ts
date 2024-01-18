import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Message } from "./Message";

@Entity()
export class Group {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  groupName: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToMany(() => User, user => user.groups)
  members: User[];

  @OneToMany(() => Message, message => message.group)
  messages: Message[];

}