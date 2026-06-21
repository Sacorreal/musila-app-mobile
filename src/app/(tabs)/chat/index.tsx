import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { useConversations } from '@/domains/chat/hooks/use-chat.hooks';
import { ConversationItem } from '@/domains/chat/components/ConversationItem';
import type { TrackRequest } from '@/domains/requests/types/requests.types';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: conversations = [], isLoading } = useConversations();

  const handleConversationPress = (request: TrackRequest) => {
    if (request.chat?.id) {
      router.push(`/(tabs)/chat/${request.chat.id}` as any);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Orbe decorativo */}
      <View style={styles.bgOrb} pointerEvents="none" />

      {/* Encabezado */}
      <ReAnimated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.subtitle}>Conversaciones sobre solicitudes activas</Text>
      </ReAnimated.View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Brand.primary} size="large" />
        </View>
      ) : conversations.length === 0 ? (
        <ReAnimated.View entering={FadeInDown.delay(120).springify()} style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>Sin conversaciones</Text>
          <Text style={styles.emptySubtitle}>
            Los chats aparecerán aquí cuando existan solicitudes activas
          </Text>
        </ReAnimated.View>
      ) : (
        <ReAnimated.View entering={FadeInDown.delay(120).springify()} style={styles.flex}>
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ConversationItem
                request={item}
                userId={user?.id}
                onPress={handleConversationPress}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </ReAnimated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  bgOrb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(32,138,239,0.06)',
    top: -60,
    right: -80,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 24,
    gap: 4,
  },
  title: {
    ...Typography.display,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.4)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 4,
  },
  emptyTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptySubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  listContent: {
    paddingBottom: 40,
  },
});
