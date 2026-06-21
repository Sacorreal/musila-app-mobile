import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import type { TracksResponseDto } from '../types/tracks.types';

interface TrackCardProps {
  track: TracksResponseDto;
  onPress?: (track: TracksResponseDto) => void;
}

const COVER_SIZE = 56;
const PLACEHOLDER = require('@/assets/images/icon.png');

export function TrackCard({ track, onPress }: TrackCardProps) {
  const authorLabel = Array.isArray(track.authors)
    ? track.authors
        .map((a) => (typeof a === 'string' ? a : `${a.name} ${a.lastName}`))
        .join(', ')
    : '';

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress?.(track)}
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
        {!!track.genre && (
          <Text style={styles.genre} numberOfLines={1}>
            {track.genre}
          </Text>
        )}
      </View>
      <View style={[styles.dot, track.isAvailable ? styles.dotActive : styles.dotInactive]} />
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
    width: COVER_SIZE,
    height: COVER_SIZE,
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#4ade80',
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
