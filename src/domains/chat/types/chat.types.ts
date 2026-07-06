export enum MessageType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
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
  fileKey?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: string;
}

export interface PaginatedMessagesResponse {
  data: Message[];
  total: number;
}

export interface SendMessagePayload {
  chatId: string;
  content: string;
  type: MessageType;
  filekey?: string;
  fileName?: string;
  fileUrl?: string;
}

export interface IncomingMessagePayload {
  chatId: string;
  messageId: string;
  senderId: string;
  content: string;
  type: MessageType;
  titleTrack?: string;
  fileUrl?: string;
  fileKey?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}
