import { useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
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

  const barWidthRef = useRef(0);
  const startXRef = useRef(0);
  const durationRef = useRef(duration);
  durationRef.current = duration;
  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;
  const onScrubRef = useRef(onScrub);
  onScrubRef.current = onScrub;

  const updateRatioFromX = (x: number) => {
    if (!barWidthRef.current) return;
    const ratio = clamp(x / barWidthRef.current, 0, 1);
    setDragRatio(ratio);
    onScrubRef.current?.(ratio * durationRef.current);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!durationRef.current,
      onMoveShouldSetPanResponder: (_evt, gestureState) =>
        !!durationRef.current && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderGrant: (evt) => {
        startXRef.current = evt.nativeEvent.locationX;
        setIsDragging(true);
        updateRatioFromX(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (_evt, gestureState) => {
        updateRatioFromX(startXRef.current + gestureState.dx);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const x = startXRef.current + gestureState.dx;
        const ratio = barWidthRef.current ? clamp(x / barWidthRef.current, 0, 1) : 0;
        setIsDragging(false);
        onSeekRef.current(ratio * durationRef.current);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
      },
    }),
  ).current;

  const playbackRatio = duration > 0 ? clamp(progress / duration, 0, 1) : 0;
  const ratio = isDragging ? dragRatio : playbackRatio;

  return (
    <View
      style={styles.hitArea}
      onLayout={(e) => {
        barWidthRef.current = e.nativeEvent.layout.width;
        setBarWidth(e.nativeEvent.layout.width);
      }}
      {...panResponder.panHandlers}
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
