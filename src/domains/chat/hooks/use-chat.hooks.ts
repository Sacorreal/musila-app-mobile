import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chat.service';
import { useRequests } from '@/domains/requests/hooks/use-requests.hooks';

export function useChatMessages(chatId: string) {
  return useQuery({
    queryKey: ['chat', chatId, 'messages'],
    queryFn: () => chatService.getMessages(chatId),
    enabled: !!chatId,
    refetchInterval: 10_000,
  });
}

export function useConversations() {
  const { data: requests = [], ...rest } = useRequests();
  const conversations = requests.filter((r) => !!r.chat?.id);
  return { data: conversations, ...rest };
}
