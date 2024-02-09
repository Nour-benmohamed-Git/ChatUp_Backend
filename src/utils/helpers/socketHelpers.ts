import { Socket } from 'socket.io';
import { Server as SocketIOServer } from 'socket.io';

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

  static async isUserInRoom(
    io: SocketIOServer,
    userId: string | number,
    roomName: string
  ): Promise<boolean> {
    try {
      // Fetch all sockets connected to the Socket.IO server
      const sockets = await io.fetchSockets();

      // Check each socket if it belongs to the specified user and is in the specified room
      for (const socket of sockets) {
        if (socket.data.userId === userId && socket.rooms.has(roomName)) {
          return true; // User is in the room
        }
      }
      return false; // User is not in the room
    } catch (error) {
      console.error('Error fetching sockets:', error);
      return false; // Error occurred, assume user is not in the room
    }
  }
}
