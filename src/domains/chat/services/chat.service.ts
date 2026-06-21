import { api } from '@/shared/libs/api';
import { apiURLs } from '@/shared/constants/urls';
import type { Message, PaginatedMessagesResponse } from '../types/chat.types';

export const chatService = {
  async getMessages(chatId: string): Promise<Message[]> {
    const { data } = await api.get<PaginatedMessagesResponse>(apiURLs.chats.messages(chatId));
    return Array.isArray(data.data) ? data.data : (Array.isArray(data as any) ? (data as any) : []);
  },

  async markAsRead(chatId: string): Promise<void> {
    await api.post(apiURLs.chats.read(chatId));
  },
};
