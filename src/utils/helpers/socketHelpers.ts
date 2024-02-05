import { Socket } from 'socket.io';

export class SocketHelper {
  static setupRoomListeners(socket: Socket, userId: string): void {
    socket.on('joinPrivateRoom', (chatSessionId: string) =>
      this.joinPrivateRoom(socket, userId, chatSessionId)
    );
    socket.on('joinGroupRoom', (groupId: string) =>
      this.joinGroupRoom(socket, groupId)
    );
    socket.join(`user-${userId}`); // Personal room for direct messages or notifications
  }

  static joinPrivateRoom(
    socket: Socket,
    userId: string,
    chatSessionId: string
  ): void {
    socket.join(`room-${chatSessionId}`);
    console.log(`User ${userId} joined private room: room-${chatSessionId}`);
  }

  static joinGroupRoom(socket: Socket, groupId: string): void {
    socket.join(`group-${groupId}`);
    console.log(`New user joined group room: group-${groupId}`);
  }
}
