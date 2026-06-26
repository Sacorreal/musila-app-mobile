import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { useChatMessages } from '@/domains/chat/hooks/use-chat.hooks';
import { MessageBubble } from '@/domains/chat/components/MessageBubble';

export function ChatDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);

  const { data: messages = [], isLoading } = useChatMessages(id ?? '');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Conversación</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Brand.primary} size="large" />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>Sin mensajes aún</Text>
        </View>
      ) : (
        <FlatList
          data={[...messages].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isOwn={item.sender?.id === user?.id} />
          )}
          inverted
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 16 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.inputPlaceholder}>
          <Text style={styles.inputPlaceholderText}>
            El envío de mensajes estará disponible próximamente
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.4)',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputPlaceholderText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
  },
});
