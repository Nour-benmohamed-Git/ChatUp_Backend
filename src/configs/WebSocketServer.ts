import { Express } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import { FriendRequestDTO } from '../dto/FriendRequestDTO';
import { MessageDTO } from '../dto/MessageDTO';
import { ChatSessionService } from '../services/ChatSessionService';
import { FriendRequestService } from '../services/FriendRequestService';
import { MessageService } from '../services/MessageService';
import { UserService } from '../services/UserService';
import { SocketHelper } from '../utils/helpers/socketHelpers';

export class WebSocketServer {
  private httpServer: HTTPServer;
  private io: SocketIOServer;
  private port: string | number;
  private secretKey: string;
  private messageService: MessageService;
  private chatSessionService: ChatSessionService;
  private friendRequestService: FriendRequestService;
  private userService: UserService;
  private unreadMessages: { [userId: string]: number[] };
  private unseenChatSessions: { [userId: string]: number[] };
  private unseenFriendRequests: { [userId: string]: number[] };

  constructor(app: Express) {
    this.secretKey = process.env.SECRET_KEY!;
    this.httpServer = createServer(app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: { origin: '*' },
    });
    this.port = process.env.SOCKET_PORT || 3000;
    this.messageService = new MessageService();
    this.chatSessionService = new ChatSessionService();
    this.friendRequestService = new FriendRequestService();
    this.userService = new UserService();
    this.unreadMessages = {};
    this.unseenChatSessions = {};
    this.unseenFriendRequests = {};

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

        // socket.on('disconnect', () => {
        //   const userId = socket.data.userId;
        //   if (userId) {
        //     console.log(`User ${userId} disconnected`);
        //     // Here you can perform any additional cleanup or logging
        //   }
        // });
        socket.data.userId = userId;
        SocketHelper.setupRoomListeners(socket, userId.toString());

        socket.on(
          'send-friend-request',
          async (friendRequestData: {
            action: 'send' | 'accept' | 'decline' | 'markAsSeen';
            friendRequest: FriendRequestDTO;
          }) => {
            const { action, friendRequest } = friendRequestData;
            switch (action) {
              case 'send':
                this.io
                  .to(`user-${friendRequest.receiverId}`)
                  .emit('friend-request-notification', {
                    action: 'send',
                    friendRequest: friendRequest,
                  });
                this.unseenFriendRequests[friendRequest.receiverId] =
                  this.unseenFriendRequests[friendRequest.receiverId] || [];
                this.unseenFriendRequests[friendRequest.receiverId].push(
                  friendRequest.id
                );
                if (
                  this.unseenFriendRequests[friendRequest.receiverId]?.length
                ) {
                  this.io
                    .to(`user-${friendRequest.receiverId}`)
                    .emit('friendRequestCount', {
                      unseenFriendRequests:
                        this.unseenFriendRequests[friendRequest.receiverId]
                          ?.length,
                    });
                }
                break;
              case 'markAsSeen':
                // socket.emit('friend-request-notification', {
                //   action: 'markAsSeen',
                //   unseenFriendRequestsIds:
                //     this.unseenFriendRequests[friendRequest.receiverId],
                // });
                await this.friendRequestService.markFriendRequestsAsSeen(
                  this.unseenFriendRequests[friendRequest.receiverId]
                );
                this.unseenFriendRequests[friendRequest.receiverId] = [];
                this.io
                  .to(`user-${friendRequest.receiverId}`)
                  .emit('friendRequestCount', {
                    unseenFriendRequests: 0,
                  });
                break;
              case 'accept':
                {
                  const user = await this.userService.getUser(
                    friendRequest.receiverId
                  );
                  this.io
                    .to(`user-${friendRequest.senderId}`)
                    .emit('friend-request-notification', {
                      action: 'accept',
                      friendRequest: friendRequest,
                      message: `${user.username} has accepted your friend request.`,
                    });
                }
                break;
              case 'decline':
                {
                  const user = await this.userService.getUser(
                    friendRequest.receiverId
                  );
                  this.io
                    .to(`user-${friendRequest.senderId}`)
                    .emit('friend-request-notification', {
                      action: 'decline',
                      friendRequest: friendRequest,
                      message: `${user.username} has declined your friend request.`,
                    });
                }
                break;
            }
          }
        );

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
                      if (
                        !this.unseenChatSessions[message.receiverId]?.includes(
                          message.chatSessionId
                        )
                      ) {
                        this.unseenChatSessions[message.receiverId] =
                          this.unseenChatSessions[message.receiverId] || [];
                        this.unseenChatSessions[message.receiverId].push(
                          message.chatSessionId
                        );
                        this.io
                          .to(`user-${message.receiverId}`)
                          .emit('conversationCount', {
                            unseenConversations:
                              this.unseenChatSessions[message.receiverId]
                                ?.length,
                          });
                      }
                      await this.chatSessionService.updateUnreadMessages(
                        message.chatSessionId,
                        this.unreadMessages,
                        userId
                      );
                      this.io
                        .to([
                          `user-${message.receiverId}`,
                          `user-${message.senderId}`,
                        ])
                        .emit('notification', {
                          type: 'updateChatListOnAddition',
                          unreadMessages: this.unreadMessages,
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
                  await this.chatSessionService.updateUnreadMessages(
                    message.chatSessionId,
                    this.unreadMessages,
                    userId
                  );

                  const index = this.unseenChatSessions[
                    message.receiverId
                  ]?.indexOf(message.chatSessionId);
                  if (index !== -1) {
                    this.unseenChatSessions[message.receiverId]?.splice(
                      index,
                      1
                    );
                    await this.chatSessionService.markChatSessionAsSeen(
                      message?.chatSessionId,
                      userId
                    );
                    this.io
                      .to(`user-${message.receiverId}`)
                      .emit('conversationCount', {
                        unseenConversations:
                          this.unseenChatSessions[message.receiverId]?.length,
                      });
                  }

                  this.io
                    .to(`user-${message.receiverId}`)
                    .emit('notification', {
                      type: 'markAsReadOnChatListUpdate',
                      data: {
                        id: message.chatSessionId,
                      },
                      unreadMessages: this.unreadMessages,
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
                          this.unreadMessages[message.receiverId]?.splice(
                            index,
                            1
                          );

                          this.chatSessionService.updateUnreadMessages(
                            message.chatSessionId,
                            this.unreadMessages,
                            userId
                          );
                          this.io
                            .to([
                              `user-${message.receiverId}`,
                              `user-${message.senderId}`,
                            ])
                            .emit('notification', {
                              type: 'updateChatListOnHardRemoval',
                              unreadMessages: this.unreadMessages,
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
