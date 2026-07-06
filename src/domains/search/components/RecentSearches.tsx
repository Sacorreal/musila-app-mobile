import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { useRecentSearchesStore } from '../store/useRecentSearchesStore';

interface RecentSearchesProps {
  onSelect: (query: string) => void;
}

export function RecentSearches({ onSelect }: RecentSearchesProps) {
  const theme = useTheme();
  const entries = useRecentSearchesStore((s) => s.entries);
  const removeSearch = useRecentSearchesStore((s) => s.removeSearch);
  const clearAll = useRecentSearchesStore((s) => s.clearAll);

  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textSecondary }]}>Búsquedas recientes</Text>
        <Pressable onPress={clearAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.clearAll}>Borrar todo</Text>
        </Pressable>
      </View>

      {entries.map((entry) => (
        <Pressable
          key={entry.id}
          style={({ pressed }) => [
            styles.row,
            { borderBottomColor: theme.backgroundElement },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => onSelect(entry.query)}
        >
          <MaterialCommunityIcons name="history" size={18} color={theme.textSecondary} />
          <Text style={[styles.query, { color: theme.text }]} numberOfLines={1}>
            {entry.query}
          </Text>
          <Pressable
            onPress={() => removeSearch(entry.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="close" size={16} color={theme.textSecondary} />
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  title: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  clearAll: {
    ...Typography.caption,
    color: Brand.primary,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  query: {
    ...Typography.body,
    flex: 1,
  },
});
