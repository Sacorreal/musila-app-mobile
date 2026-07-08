import { useLocalSearchParams } from 'expo-router';
import { ChatDetailScreen } from '@/domains/chat/components/ChatDetailScreen';

export default function ChatDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ChatDetailScreen key={id} />;
}
