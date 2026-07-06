import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '@/shared/constants/urls';
import type { SendMessagePayload } from '../types/chat.types';

const CHAT_NAMESPACE_URL = `${BASE_URL.replace(/\/api\/v\d+\/?$/, '').replace(/\/$/, '')}/chat`;

class ChatSocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;

  connect(token: string): Socket | null {
    if (this.socket && this.socket.connected && this.currentToken !== token) {
      this.disconnect();
    }

    if (!this.socket || !this.socket.connected) {
      this.socket = io(CHAT_NAMESPACE_URL, {
        auth: { token: `Bearer ${token}` },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
      });
      this.currentToken = token;
    }

    return this.socket;
  }

  joinChat(chatId: string): void {
    this.socket?.emit('joinChat', { chatId });
  }

  sendMessage(payload: SendMessagePayload): void {
    if (this.socket?.connected) {
      this.socket.emit('sendMessage', payload);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentToken = null;
    }
  }
}

export const chatSocketService = new ChatSocketService();
