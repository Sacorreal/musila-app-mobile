export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  IMAGE = 'image',
}

export interface MessageSender {
  id: string;
  name: string;
  lastName: string;
  avatarUrl?: string;
}

export interface Message {
  id: string;
  chatId: string;
  sender: MessageSender;
  content: string;
  type: MessageType;
  fileUrl?: string | null;
  createdAt: string;
}

export interface PaginatedMessagesResponse {
  data: Message[];
  total: number;
}
