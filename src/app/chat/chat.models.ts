export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  socketId: string;
}

export interface SystemMessage {
  message: string;
  timestamp: string;
}

export interface TypingUser {
  username: string;
  socketId: string;
}

export interface ChatFeedItem {
  id: string;
  type: 'chat' | 'system' | 'welcome';
  username?: string;
  message: string;
  timestamp: string;
  socketId?: string;
}

