import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Typography } from '@/constants/theme';
import type { Playlist } from '../types/playlists.types';

interface PlaylistCardProps {
  playlist: Playlist;
  onPress?: (playlist: Playlist) => void;
  onPlayPress?: (playlist: Playlist) => void;
}

const PLACEHOLDER = require('@/assets/images/icon.png');

export function PlaylistCard({ playlist, onPress, onPlayPress }: PlaylistCardProps) {
  const trackCount = playlist.tracks?.length ?? 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress?.(playlist)}
    >
      <View style={styles.coverWrapper}>
        <Image
          source={playlist.cover ? { uri: playlist.cover } : PLACEHOLDER}
          style={styles.cover}
          contentFit="cover"
        />
        {trackCount > 0 && onPlayPress && (
          <Pressable
            style={({ pressed }) => [styles.playBtn, pressed && { transform: [{ scale: 0.92 }] }]}
            onPress={() => onPlayPress(playlist)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Reproducir ${playlist.title}`}
          >
            <MaterialCommunityIcons name="play" size={16} color="#FFFFFF" style={styles.playIconOffset} />
          </Pressable>
        )}
      </View>
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
  coverWrapper: {
    position: 'relative',
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  playBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  playIconOffset: {
    marginLeft: 2,
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
