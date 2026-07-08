import { StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { RESOURCE_LABELS } from '../constants/resource-labels';
import type { PlanResource } from '../types/plan.types';

interface UsageBarProps {
  resource: PlanResource;
  current: number;
  limit: number | null;
}

export function UsageBar({ resource, current, limit }: UsageBarProps) {
  const isUnlimited = limit === null;
  const pct = isUnlimited ? 0 : Math.min(100, (current / Math.max(limit, 1)) * 100);
  const isNearLimit = !isUnlimited && current >= limit;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{RESOURCE_LABELS[resource]}</Text>
        <Text style={styles.count}>{isUnlimited ? `${current} · Ilimitado` : `${current} / ${limit}`}</Text>
      </View>
      {!isUnlimited && (
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${pct}%`, backgroundColor: isNearLimit ? '#F87171' : Brand.accent },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  count: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.5)',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
