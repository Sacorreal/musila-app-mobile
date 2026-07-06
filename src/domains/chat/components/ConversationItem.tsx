import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { RequestStatusBadge } from '@/domains/requests/components/RequestStatusBadge';
import type { TrackRequest } from '@/domains/requests/types/requests.types';
import { formatFullName } from '@/shared/utils/formatName';

interface ConversationItemProps {
  request: TrackRequest;
  userId?: string;
  onPress: (request: TrackRequest) => void;
}

const COVER_SIZE = 52;
const PLACEHOLDER = require('@/assets/images/icon.png');

export function ConversationItem({ request, userId, onPress }: ConversationItemProps) {
  const trackAuthors = request.track?.authors ?? [];
  const isAuthor = Array.isArray(trackAuthors)
    ? trackAuthors.some((a) => (typeof a === 'string' ? a : a.id) === userId)
    : false;

  const otherPartyName = isAuthor
    ? formatFullName(request.requester?.name, request.requester?.lastName)
    : 'Autor';

  const hasUnread = (request.unreadCount ?? 0) > 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => onPress(request)}
    >
      <Image
        source={request.track?.coverUrl ? { uri: request.track.coverUrl } : PLACEHOLDER}
        style={styles.cover}
        contentFit="cover"
      />
      <View style={styles.info}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {request.track?.title ?? 'Sin título'}
        </Text>
        <Text style={styles.party} numberOfLines={1}>
          {otherPartyName}
        </Text>
        <RequestStatusBadge status={request.status} />
      </View>
      {hasUnread && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{request.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    gap: 12,
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.75,
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  trackTitle: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  party: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.5)',
  },
  unreadBadge: {
    backgroundColor: Brand.primary,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
