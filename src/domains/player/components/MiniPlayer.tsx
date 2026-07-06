import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReAnimated, { FadeInUp, FadeOutDown, LinearTransition } from 'react-native-reanimated';
import { Brand, Typography } from '@/constants/theme';
import { usePlayerStore } from '@/shared/stores/player.store';

export const MINI_PLAYER_HEIGHT = 60;

const COVER_PLACEHOLDER = require('@/assets/images/icon.png');

interface MiniPlayerProps {
  bottom: number;
  canRequestUse: boolean;
  onRequestUse: () => void;
}

export function MiniPlayer({ bottom, canRequestUse, onRequestUse }: MiniPlayerProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const setExpanded = usePlayerStore((s) => s.setExpanded);

  if (!currentTrack) return null;

  const progressRatio = duration > 0 ? Math.min(progress / duration, 1) : 0;

  return (
    <ReAnimated.View
      entering={FadeInUp.springify().damping(18)}
      exiting={FadeOutDown.duration(200)}
      layout={LinearTransition.springify().damping(18)}
      style={[styles.container, { bottom }]}
    >
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
      </View>

      <View style={styles.row}>
        <Pressable
          style={styles.trackInfo}
          onPress={() => setExpanded(true)}
          accessibilityRole="button"
          accessibilityLabel={`Abrir reproductor: ${currentTrack.title}`}
        >
          <Image
            source={currentTrack.albumArt ? { uri: currentTrack.albumArt } : COVER_PLACEHOLDER}
            style={styles.cover}
            contentFit="cover"
          />
          <View style={styles.textColumn}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
        </Pressable>

        {canRequestUse && (
          <Pressable
            style={({ pressed }) => [styles.requestBtn, pressed && { opacity: 0.7 }]}
            onPress={onRequestUse}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Solicitar uso de la canción"
          >
            <Text style={styles.requestBtnText}>Solicitar</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [styles.playBtn, pressed && { transform: [{ scale: 0.92 }] }]}
          onPress={() => setPlaying(!isPlaying)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          <MaterialCommunityIcons
            name={isPlaying ? 'pause' : 'play'}
            size={22}
            color="#FFFFFF"
            style={!isPlaying ? { marginLeft: 2 } : undefined}
          />
        </Pressable>
      </View>
    </ReAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: MINI_PLAYER_HEIGHT,
    borderRadius: 14,
    backgroundColor: 'rgba(22,28,40,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(60,159,254,0.25)',
    overflow: 'hidden',
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressFill: {
    height: 2,
    backgroundColor: Brand.accent,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  trackInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  textColumn: {
    flex: 1,
    gap: 1,
  },
  title: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  artist: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.5)',
  },
  requestBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(60,159,254,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(60,159,254,0.3)',
  },
  requestBtnText: {
    ...Typography.caption,
    color: Brand.accent,
    fontWeight: '700',
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.primaryDark,
  },
});
