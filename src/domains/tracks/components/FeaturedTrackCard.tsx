import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand } from '@/constants/theme';
import { formatFullName } from '@/shared/utils/formatName';
import type { TracksResponseDto } from '../types/tracks.types';
import { resolveGenreName } from '../utils/resolveGenreName';

interface FeaturedTrackCardProps {
  track: TracksResponseDto;
  onPress?: (track: TracksResponseDto) => void;
}

const PLACEHOLDER = require('@/assets/images/icon.png');

export function FeaturedTrackCard({ track, onPress }: FeaturedTrackCardProps) {
  const authorLabel = Array.isArray(track.authors)
    ? track.authors
        .map((a) => (typeof a === 'string' ? a : formatFullName(a.name, a.lastName)))
        .join(', ')
    : '';

  const genreName = resolveGenreName(track.genre);
  const genreLabel = track.subGenre ? `${genreName} - ${track.subGenre}` : genreName;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress?.(track)}
    >
      <View style={styles.coverWrapper}>
        <Image
          source={track.coverUrl ? { uri: track.coverUrl } : PLACEHOLDER}
          style={styles.cover}
          contentFit="cover"
        />
        <View style={[styles.dot, track.isAvailable ? styles.dotActive : styles.dotInactive]} />
      </View>
      <Text style={styles.title}>{track.title}</Text>
      {!!authorLabel && <Text style={styles.author}>{authorLabel}</Text>}
      {!!genreLabel && <Text style={styles.genre}>{genreLabel}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 8,
    gap: 4,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  coverWrapper: {
    position: 'relative',
    marginBottom: 2,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 12,
    lineHeight: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  author: {
    fontSize: 10,
    lineHeight: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  genre: {
    fontSize: 10,
    lineHeight: 13,
    color: Brand.accent,
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#111827',
  },
  dotActive: {
    backgroundColor: '#4ade80',
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
