import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Brand, Typography } from '@/constants/theme';
import { formatFullName } from '@/shared/utils/formatName';
import { resolveGenreName } from '@/domains/tracks/utils/resolveGenreName';
import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';

interface PlaylistTrackRowProps {
  track: TracksResponseDto;
  onPress: () => void;
  onRemove?: () => void;
}

const PLACEHOLDER = require('@/assets/images/icon.png');

export function PlaylistTrackRow({ track, onPress, onRemove }: PlaylistTrackRowProps) {
  const authorLabel = Array.isArray(track.authors)
    ? track.authors
        .map((a) => (typeof a === 'string' ? a : formatFullName(a.name, a.lastName)))
        .join(', ')
    : '';

  const genreName = resolveGenreName(track.genre);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Image
        source={track.coverUrl ? { uri: track.coverUrl } : PLACEHOLDER}
        style={styles.cover}
        contentFit="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        {!!authorLabel && (
          <Text style={styles.author} numberOfLines={1}>
            {authorLabel}
          </Text>
        )}
        {!!genreName && (
          <Text style={styles.genre} numberOfLines={1}>
            {genreName}
          </Text>
        )}
      </View>
      {onRemove && (
        <Pressable
          style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.6 }]}
          onPress={onRemove}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`Quitar ${track.title} de la playlist`}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="rgba(255,80,80,0.7)" />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 10,
    gap: 12,
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  author: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.5)',
  },
  genre: {
    ...Typography.caption,
    color: Brand.accent,
  },
  removeBtn: {
    padding: 4,
    flexShrink: 0,
  },
});
