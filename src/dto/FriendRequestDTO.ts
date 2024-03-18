import { FriendRequest } from '../models/FriendRequest';
import { FriendRequestStatus } from '../utils/constants/enums';

export class FriendRequestDTO {
  id?: number;
  title?: string;
  image?: string;
  timestamp?: number;
  receiverId?: number;
  senderId?: number;
  status?: FriendRequestStatus;
  seen?: boolean;

  constructor(friendRequest: FriendRequest) {
    this.id = friendRequest.id;
    this.title = friendRequest.sender.username;
    this.image = friendRequest.sender.profilePicture;
    this.timestamp = friendRequest.timestamp;
    this.receiverId = friendRequest.receiver.id;
    this.senderId = friendRequest.sender.id;
    this.status = friendRequest.status;
    this.seen = friendRequest.seen;
  }
}
