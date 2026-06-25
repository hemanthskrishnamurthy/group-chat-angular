import { Injectable, OnDestroy, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ChatFeedItem, ChatMessage, SystemMessage, TypingUser } from './chat.models';

const SOCKET_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  private socket: Socket;
  private typingTimeout?: ReturnType<typeof setTimeout>;

  readonly feed = signal<ChatFeedItem[]>([]);
  readonly onlineCount = signal(0);
  readonly error = signal('');
  readonly isConnected = signal(false);
  readonly hasJoined = signal(false);
  readonly currentUsername = signal('');
  readonly currentSocketId = signal('');
  readonly typingUsers = signal<TypingUser[]>([]);

  constructor() {
    this.socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    this.registerSocketListeners();
  }

  connect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  joinChat(username: string): void {
    this.error.set('');
    this.connect();
    this.socket.emit('join_chat', { username });
  }

  sendMessage(message: string): void {
    this.error.set('');
    this.socket.emit('send_message', { message });
    this.stopTyping();
  }

  startTyping(): void {
    if (!this.hasJoined()) {
      return;
    }

    this.socket.emit('typing', { isTyping: true });

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.typingTimeout = setTimeout(() => this.stopTyping(), 1200);
  }

  stopTyping(): void {
    if (!this.hasJoined()) {
      return;
    }

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = undefined;
    }

    this.socket.emit('stop_typing');
  }

  disconnect(): void {
    this.socket.disconnect();
    this.resetSession();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private registerSocketListeners(): void {
    this.socket.on('connect', () => {
      this.isConnected.set(true);
      this.currentSocketId.set(this.socket.id ?? '');
    });

    this.socket.on('disconnect', () => {
      this.isConnected.set(false);
      this.hasJoined.set(false);
      this.typingUsers.set([]);
    });

    this.socket.on('welcome_message', (payload: SystemMessage) => {
      this.hasJoined.set(true);
      this.currentUsername.set(this.extractUsernameFromWelcome(payload.message));
      this.addFeedItem({
        id: crypto.randomUUID(),
        type: 'welcome',
        message: payload.message,
        timestamp: payload.timestamp,
      });
    });

    this.socket.on('system_message', (payload: SystemMessage) => {
      this.addFeedItem({
        id: crypto.randomUUID(),
        type: 'system',
        message: payload.message,
        timestamp: payload.timestamp,
      });
    });

    this.socket.on('receive_message', (payload: ChatMessage) => {
      this.removeTypingUser(payload.socketId);
      this.addFeedItem({
        id: payload.id,
        type: 'chat',
        username: payload.username,
        message: payload.message,
        timestamp: payload.timestamp,
        socketId: payload.socketId,
      });
    });

    this.socket.on('online_users', (payload: { count: number }) => {
      this.onlineCount.set(payload.count);
    });

    this.socket.on('user_typing', (payload: TypingUser) => {
      this.typingUsers.update((users) => {
        if (users.some((user) => user.socketId === payload.socketId)) {
          return users;
        }

        return [...users, payload];
      });
    });

    this.socket.on('user_stop_typing', (payload: TypingUser) => {
      this.removeTypingUser(payload.socketId);
    });

    this.socket.on('chat_error', (payload: { message: string }) => {
      this.error.set(payload.message);
    });
  }

  private addFeedItem(item: ChatFeedItem): void {
    this.feed.update((items) => [...items, item]);
  }

  private removeTypingUser(socketId: string): void {
    this.typingUsers.update((users) => users.filter((user) => user.socketId !== socketId));
  }

  private resetSession(): void {
    this.hasJoined.set(false);
    this.currentUsername.set('');
    this.currentSocketId.set('');
    this.typingUsers.set([]);
    this.onlineCount.set(0);
  }

  private extractUsernameFromWelcome(message: string): string {
    return message.replace('Welcome to the chat, ', '').replace('!', '');
  }
}

