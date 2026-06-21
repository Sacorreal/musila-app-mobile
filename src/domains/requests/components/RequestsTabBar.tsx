import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';

export type TabKey = 'enviadas' | 'recibidas';

interface RequestsTabBarProps {
  activeTab: TabKey;
  availableTabs: TabKey[];
  sentCount: number;
  receivedCount: number;
  onTabChange: (tab: TabKey) => void;
}

const TAB_LABELS: Record<TabKey, string> = {
  enviadas: 'Enviadas',
  recibidas: 'Recibidas',
};

export function RequestsTabBar({
  activeTab,
  availableTabs,
  sentCount,
  receivedCount,
  onTabChange,
}: RequestsTabBarProps) {
  const counts: Record<TabKey, number> = { enviadas: sentCount, recibidas: receivedCount };

  if (availableTabs.length < 2) return null;

  return (
    <View style={styles.container}>
      {availableTabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <Pressable key={tab} style={styles.tab} onPress={() => onTabChange(tab)}>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {TAB_LABELS[tab]}
              {counts[tab] > 0 ? `  ${counts[tab]}` : ''}
            </Text>
            {isActive && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 12,
    position: 'relative',
  },
  label: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  indicator: {
    position: 'absolute',
    bottom: -1,
    left: '20%',
    right: '20%',
    height: 2,
    borderRadius: 1,
    backgroundColor: Brand.primary,
  },
});
