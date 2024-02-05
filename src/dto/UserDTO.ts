import { UserStatus } from '../utils/constants/enums';
import { User } from '../models/User';

export class UserDTO {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: UserStatus;
  profileInfo: string;
  createdAt: number;
  updatedAt: number;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.username = user.username;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.phone = user.phone;
    this.status = user.status;
    this.profileInfo = user.profileInfo;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
