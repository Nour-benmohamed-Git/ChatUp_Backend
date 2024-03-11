import { Express } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import { MessageDTO } from '../dto/MessageDTO';
import { NotificationDTO } from '../dto/NotificationDTO';
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

        socket.on(
          'send-friend-request',
          async (friendRequestData: {
            action: 'send' | 'accept' | 'decline' | 'markAsSeen';
            friendRequest: NotificationDTO;
          }) => {
            const { action, friendRequest } = friendRequestData;
            // console.log(friendRequest);
            switch (action) {
              case 'send':
                socket.emit('friend-request-notification', {
                  action: 'accept',
                  friendRequest: friendRequest,
                });

                break;
              case 'accept':
                socket.emit('friend-request-notification', {
                  action: 'accept',
                  friendRequest: friendRequest,
                });

                break;
              case 'decline':
                socket.emit('friend-request-notification', {
                  action: 'decline',
                  friendRequest: friendRequest,
                });

                break;
            }
          }
        );

        // When the user accepts or declines a friend request
        socket.on('friend-request-response', (data) => {
          // Update the friend request status in the database
          // Emit a notification event to the sender
          socket
            .to(data.senderId)
            .emit('friend-request-response-notification', {
              message: data.accepted
                ? 'Friend request accepted!'
                : 'Friend request declined!',
            });
        });

        socket.on(
          'sendMessage',
          async (messageData: {
            action: 'create' | 'hardRemove' | 'markAsRead';
            message: MessageDTO;
            participantsData?: { [userId: string]: string };
          }) => {
            const { action, message, participantsData } = messageData;
            switch (action) {
              case 'create':
                SocketHelper.isUserInRoom(
                  this.io,
                  message.receiverId,
                  `room-${message.chatSessionId}`
                )
                  .then(async (inRoom) => {
                    if (!inRoom) {
                      this.io
                        .to(`room-${message.chatSessionId}`)
                        .emit('receiveMessage', {
                          action: 'create',
                          data: message,
                        });
                      this.unreadMessages[message.receiverId] =
                        this.unreadMessages[message.receiverId] || [];
                      this.unreadMessages[message.receiverId].push(message.id);

                      this.io
                        .to([
                          `user-${message.receiverId}`,
                          `user-${message.senderId}`,
                        ])
                        .emit('notification', {
                          type: 'updateChatListOnAddition',
                          count: this.unreadMessages[message.receiverId].length,
                          senderId: message.senderId,
                          participantsData: participantsData,
                          data: {
                            id: message.chatSessionId,
                            lastMessage: {
                              content: message.content,
                              timestamp: message.timestamp,
                            },
                          },
                        });
                    } else {
                      await this.messageService.markMessageAsRead(message.id);
                      this.io
                        .to(`room-${message.chatSessionId}`)
                        .emit('receiveMessage', {
                          action: 'create',
                          data: { ...message, readStatus: true },
                        });
                      this.io
                        .to([
                          `user-${message.receiverId}`,
                          `user-${message.senderId}`,
                        ])
                        .emit('notification', {
                          type: 'updateChatListOnAddition',
                          senderId: message.senderId,
                          participantsData: participantsData,
                          data: {
                            id: message.chatSessionId,
                            lastMessage: {
                              content: message.content,
                              timestamp: message.timestamp,
                            },
                          },
                        });
                    }
                  })
                  .catch((error) => {
                    console.error('Error checking user room:', error);
                  });

                break;
              case 'markAsRead':
                {
                  await this.messageService.markMessagesAsRead(
                    this.unreadMessages[message.receiverId]
                  );
                  this.io
                    .to(`room-${message.chatSessionId}`)
                    .emit('receiveMessage', {
                      action: 'markAsRead',
                      data: {
                        senderId: message.senderId,
                        receiverId: message.receiverId,
                        chatSessionId: message.chatSessionId,
                      },
                      messageIds: this.unreadMessages[message.receiverId],
                    });
                  this.unreadMessages[message.receiverId] = [];
                  this.io
                    .to(`user-${message.receiverId}`)
                    .emit('notification', {
                      type: 'markAsReadOnChatListUpdate',
                      data: {
                        id: message.chatSessionId,
                      },
                      count: 0,
                    });
                }
                break;
              case 'hardRemove':
                SocketHelper.isUserInRoom(
                  this.io,
                  message.receiverId,
                  `room-${message.chatSessionId}`
                )
                  .then(async (inRoom) => {
                    if (!inRoom) {
                      if (this.unreadMessages?.[message?.receiverId]?.length) {
                        const index = this.unreadMessages[
                          message.receiverId
                        ].indexOf(message.id);
                        if (index !== -1) {
                          this.io
                            .to(`room-${message.chatSessionId}`)
                            .emit('receiveMessage', {
                              action: 'hardRemove',
                              data: {
                                id: message.id,
                                chatSessionId: message.chatSessionId,
                              },
                            });
                          const newestMessage =
                            await this.messageService.getNewestMessage(
                              message.chatSessionId
                            );
                          this.unreadMessages[message.receiverId].splice(
                            index,
                            1
                          );
                          this.io
                            .to([
                              `user-${message.receiverId}`,
                              `user-${message.senderId}`,
                            ])
                            .emit('notification', {
                              type: 'updateChatListOnHardRemoval',
                              count:
                                this.unreadMessages[message.receiverId].length,
                              senderId: message.senderId,
                              data: {
                                id: message.chatSessionId,
                                lastMessage: {
                                  content: newestMessage?.content,
                                  timestamp: newestMessage?.timestamp,
                                },
                              },
                            });
                        }
                      } else {
                        this.io
                          .to(`room-${message.chatSessionId}`)
                          .emit('receiveMessage', {
                            action: 'hardRemove',
                            data: {
                              id: message.id,
                              chatSessionId: message.chatSessionId,
                            },
                          });
                        const newestMessage =
                          await this.messageService.getNewestMessage(
                            message.chatSessionId
                          );
                        this.io
                          .to([
                            `user-${message.receiverId}`,
                            `user-${message.senderId}`,
                          ])
                          .emit('notification', {
                            type: 'updateChatListOnHardRemoval',
                            senderId: message.senderId,
                            data: {
                              id: message.chatSessionId,
                              lastMessage: {
                                content: newestMessage?.content,
                                timestamp: newestMessage?.timestamp,
                              },
                            },
                          });
                      }
                    } else {
                      this.io
                        .to(`room-${message.chatSessionId}`)
                        .emit('receiveMessage', {
                          action: 'hardRemove',
                          data: {
                            id: message.id,
                            chatSessionId: message.chatSessionId,
                          },
                        });
                      const newestMessage =
                        await this.messageService.getNewestMessage(
                          message.chatSessionId
                        );

                      this.io
                        .to([
                          `user-${message.receiverId}`,
                          `user-${message.senderId}`,
                        ])
                        .emit('notification', {
                          type: 'updateChatListOnHardRemoval',
                          senderId: message.senderId,
                          data: {
                            id: message.chatSessionId,
                            lastMessage: {
                              content: newestMessage?.content,
                              timestamp: newestMessage?.timestamp,
                            },
                          },
                        });
                    }
                  })
                  .catch((error) => {
                    console.error('Error checking user room:', error);
                  });
                break;
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
