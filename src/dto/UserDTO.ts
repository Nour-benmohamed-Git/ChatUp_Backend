import { User } from "../models/User";

export class UserDTO {
    id: number;
    userName: string;
    profileInfo?: string;
  
    constructor(user: User) {
      this.id = user.id;
      this.userName = user.userName;
      this.profileInfo = user.profileInfo;
    }
  }