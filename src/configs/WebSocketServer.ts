import { Express } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import { MessageDTO } from '../dto/MessageDTO';
import { MessageService } from '../services/MessageService';
import { SocketHelper } from '../utils/helpers/socketHelpers';

export class WebSocketServer {
  private httpServer: HTTPServer;
  private io: SocketIOServer;
  private port: string | number;
  private secretKey: string;
  private messageService: MessageService;

  constructor(app: Express) {
    this.secretKey = process.env.SECRET_KEY!;
    this.httpServer = createServer(app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: { origin: '*' },
    });
    this.port = process.env.SOCKET_PORT || 3000;
    this.messageService = new MessageService();
    this.listen();
  }

  private listen(): void {
    this.io.on('connection', (socket) => {
      try {
        const token = socket.handshake.auth.token;
        const decodedToken = jwt.verify(token, this.secretKey) as {
          id: number;
          iat: number;
          exp: number;
        };
        const userId = decodedToken.id;

        if (!userId) {
          socket.disconnect();
          return;
        }

        socket.data.userId = userId;
        SocketHelper.setupRoomListeners(socket, userId.toString());

        // Handle sending a message in a private room
        socket.on(
          'sendMessage',
          async (messageData: {
            action: 'create' | 'remove' | 'update';
            data: MessageDTO;
            room: string;
          }) => {
            const { action, data, room } = messageData;
            switch (action) {
              case 'create':
                {
                  const createdMessage =
                    await this.messageService.createMessage(data);
                  console.log('create server ws', messageData);
                  socket.to(`room-${room}`).emit('receiveMessage', {
                    action: 'create',
                    data: {
                      id: createdMessage.id,
                      chatSessionId: createdMessage.chatSessionId,
                      timestamp: createdMessage.timestamp,
                      ...data,
                    },
                  });
                }
                break;
              case 'update':
                break;
              case 'remove':
                {
                  await this.messageService.deleteMessage(+data.content);
                  socket.to(`room-${room}`).emit('receiveMessage', {
                    action: 'remove',
                    data: {
                      id: +data.content,
                      chatSessionId: data.chatSessionId,
                    },
                  });
                }
                break;
              default:
            }
          }
        );
      } catch (error) {
        console.error('Token verification failed:', error);
        socket.disconnect();
      }
    });

    this.httpServer.listen(this.port, () => {
      console.log(`Running server on port ${this.port}`);
    });
  }
}
