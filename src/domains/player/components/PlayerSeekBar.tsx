import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, State } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Brand } from '@/constants/theme';

interface PlayerSeekBarProps {
  progress: number;
  duration: number;
  onSeek: (seconds: number) => void;
  onScrub?: (seconds: number) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function PlayerSeekBar({ progress, duration, onSeek, onScrub }: PlayerSeekBarProps) {
  const [barWidth, setBarWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragRatio, setDragRatio] = useState(0);

  const emitScrub = (ratio: number) => {
    setDragRatio(ratio);
    onScrub?.(ratio * duration);
  };

  const emitSeek = (ratio: number) => {
    setIsDragging(false);
    onSeek(ratio * duration);
  };

  const pan = Gesture.Pan()
    .enabled(duration > 0)
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onBegin((e) => {
      const ratio = barWidth ? clamp(e.x / barWidth, 0, 1) : 0;
      runOnJS(setIsDragging)(true);
      runOnJS(emitScrub)(ratio);
    })
    .onUpdate((e) => {
      const ratio = barWidth ? clamp(e.x / barWidth, 0, 1) : 0;
      runOnJS(emitScrub)(ratio);
    })
    .onEnd((e) => {
      const ratio = barWidth ? clamp(e.x / barWidth, 0, 1) : 0;
      runOnJS(emitSeek)(ratio);
    })
    .onFinalize((e) => {
      if (e.state !== State.END) {
        runOnJS(setIsDragging)(false);
      }
    });

  const playbackRatio = duration > 0 ? clamp(progress / duration, 0, 1) : 0;
  const ratio = isDragging ? dragRatio : playbackRatio;

  return (
    <GestureDetector gesture={pan}>
      <View
        style={styles.hitArea}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
          <View
            style={[
              styles.thumb,
              isDragging && styles.thumbActive,
              { left: Math.max(barWidth * ratio - (isDragging ? 8 : 6), 0) },
            ]}
          />
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    paddingVertical: 12,
    justifyContent: 'center',
  },
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
  thumbActive: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
