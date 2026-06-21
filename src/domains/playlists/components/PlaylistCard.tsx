import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';
import type { Playlist } from '../types/playlists.types';

interface PlaylistCardProps {
  playlist: Playlist;
  onPress?: (playlist: Playlist) => void;
}

const PLACEHOLDER = require('@/assets/images/icon.png');

export function PlaylistCard({ playlist, onPress }: PlaylistCardProps) {
  const trackCount = playlist.tracks?.length ?? 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress?.(playlist)}
    >
      <Image
        source={playlist.cover ? { uri: playlist.cover } : PLACEHOLDER}
        style={styles.cover}
        contentFit="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {playlist.title}
        </Text>
        <Text style={styles.count}>
          {trackCount} {trackCount === 1 ? 'canción' : 'canciones'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  info: {
    padding: 10,
    gap: 4,
  },
  title: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  count: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
  },
});
