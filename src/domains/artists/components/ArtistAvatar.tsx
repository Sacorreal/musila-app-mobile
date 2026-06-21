import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';
import type { ArtistDto } from '../types/artists.types';

interface ArtistAvatarProps {
  artist: ArtistDto;
  onPress?: (artist: ArtistDto) => void;
}

const AVATAR_SIZE = 64;

export function ArtistAvatar({ artist, onPress }: ArtistAvatarProps) {
  const initials = `${artist.name?.[0] ?? ''}${artist.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.7 }]}
      onPress={() => onPress?.(artist)}
    >
      {artist.avatar ? (
        <Image
          source={{ uri: artist.avatar }}
          style={styles.avatar}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.avatar, styles.placeholder]}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={1}>
        {artist.name}
      </Text>
      <Text style={styles.lastName} numberOfLines={1}>
        {artist.lastName}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
    marginRight: 16,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginBottom: 6,
  },
  placeholder: {
    backgroundColor: 'rgba(32,138,239,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(32,138,239,0.3)',
  },
  initials: {
    fontSize: 20,
    fontWeight: '700',
    color: '#208AEF',
  },
  name: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  lastName: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },
});
