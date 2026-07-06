import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { Brand } from '@/constants/theme';

interface PlayerSeekBarProps {
  progress: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

export function PlayerSeekBar({ progress, duration, onSeek }: PlayerSeekBarProps) {
  const [barWidth, setBarWidth] = useState(0);
  const ratio = duration > 0 ? Math.min(progress / duration, 1) : 0;

  const handleSeek = (e: GestureResponderEvent) => {
    if (!barWidth || !duration) return;
    const seekRatio = Math.min(Math.max(e.nativeEvent.locationX / barWidth, 0), 1);
    onSeek(seekRatio * duration);
  };

  return (
    <Pressable
      style={styles.track}
      onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      onPress={handleSeek}
      hitSlop={{ top: 12, bottom: 12 }}
    >
      <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      <View style={[styles.thumb, { left: Math.max(barWidth * ratio - 6, 0) }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
  },
  fill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: Brand.accent,
  },
  thumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
});
