import { StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';

interface UnreadCountBadgeProps {
  count: number;
}

export function UnreadCountBadge({ count }: UnreadCountBadgeProps) {
  if (count <= 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Brand.primary,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  text: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
