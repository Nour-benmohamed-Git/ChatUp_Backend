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
  private unreadMessages: { [userId: string]: number[] };

  constructor(app: Express) {
    this.secretKey = process.env.SECRET_KEY!;
    this.httpServer = createServer(app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: { origin: '*' },
    });
    this.port = process.env.SOCKET_PORT || 3000;
    this.messageService = new MessageService();
    this.unreadMessages = {};
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
            // console.log('data', data);
            switch (action) {
              case 'create':
                {
                  const createdMessage =
                    await this.messageService.createMessage(data);
                  this.io.to(`room-${room}`).emit('receiveMessage', {
                    action: 'create',
                    data: {
                      id: createdMessage.id,
                      chatSessionId: createdMessage.chatSessionId,
                      timestamp: createdMessage.timestamp,
                      ...data,
                    },
                  });
                  this.io.to(`user-${data.senderId}`).emit('notification', {
                    type: 'updateChatListOnAddition',
                    data: {
                      id: createdMessage.chatSessionId,
                      lastMessage: {
                        content: createdMessage.content,
                        timestamp: createdMessage.timestamp,
                      },
                    },
                  });
                  SocketHelper.isUserInRoom(
                    this.io,
                    data.receiverId,
                    `room-${room}`
                  )
                    .then((inRoom) => {
                      if (inRoom) {
                        // console.log('inRoom', inRoom);
                        // Emit notification event to sender's personal room to update their conversation list
                        this.io
                          .to(`user-${data.receiverId}`)
                          .emit('notification', {
                            type: 'updateChatListOnAddition',
                            data: {
                              id: createdMessage.chatSessionId,
                              lastMessage: {
                                content: createdMessage.content,
                                timestamp: createdMessage.timestamp,
                              },
                            },
                          });
                      } else {
                        // console.log('not in room', inRoom);
                        // Recipient is not in the room, add message to unread messages
                        this.unreadMessages[data.receiverId] =
                          this.unreadMessages[data.receiverId] || [];
                        this.unreadMessages[data.receiverId].push(
                          createdMessage.id
                        );
                        // Emit notification event to user's personal room
                        this.io
                          .to(`user-${data.receiverId}`)
                          .emit('notification', {
                            type: 'updateChatListOnAddition',
                            count: this.unreadMessages[data.receiverId].length,
                            data: {
                              id: createdMessage.chatSessionId,
                              lastMessage: {
                                content: createdMessage.content,
                                timestamp: createdMessage.timestamp,
                              },
                            },
                          });
                      }
                    })
                    .catch((error) => {
                      console.error('Error checking user room:', error);
                    });
                }
                break;
              case 'update':
                break;
              case 'remove':
                {
                  await this.messageService.deleteMessage(+data.content);
                  this.io.to(`room-${room}`).emit('receiveMessage', {
                    action: 'remove',
                    data: {
                      id: +data.content,
                      chatSessionId: data.chatSessionId,
                    },
                  });

                  const newestMessage =
                    await this.messageService.getNewestMessage(
                      data.chatSessionId
                    );
                  console.log(data);
                  this.io.to(`user-${+data.senderId}`).emit('notification', {
                    type: 'updateChatListOnRemoval',
                    data: {
                      id: data.chatSessionId,
                      lastMessage: {
                        content: newestMessage.content,
                        timestamp: newestMessage.timestamp,
                      },
                    },
                  });
                }
                break;
              default:
            }
          }
        );
        // socket.on('markAsRead', (chatSessionId: string) => {
        //   const userId = socket.data.userId;
        //   if (userId && this.unreadMessages[userId]) {
        //     this.unreadMessages[userId] = this.unreadMessages[userId].filter(id => id !== chatSessionId);
        //   }
        // });
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
