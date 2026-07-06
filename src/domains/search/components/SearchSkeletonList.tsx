import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/shared/hooks/use-theme';

const ROWS = 5;

function SkeletonRow({ backgroundColor }: { backgroundColor: string }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.row, animatedStyle]}>
      <View style={[styles.cover, { backgroundColor }]} />
      <View style={styles.info}>
        <View style={[styles.line, styles.lineTitle, { backgroundColor }]} />
        <View style={[styles.line, styles.lineSubtitle, { backgroundColor }]} />
      </View>
    </Animated.View>
  );
}

export function SearchSkeletonList() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: ROWS }).map((_, index) => (
        <SkeletonRow key={index} backgroundColor={theme.backgroundElement} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    gap: 8,
  },
  line: {
    height: 12,
    borderRadius: 6,
  },
  lineTitle: {
    width: '60%',
  },
  lineSubtitle: {
    width: '35%',
  },
});
