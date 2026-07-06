import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { HighlightText } from '@/shared/components/HighlightText';
import { useTheme } from '@/shared/hooks/use-theme';
import type { SearchGenreDto } from '../types/search.types';

interface SearchGenreItemProps {
  genre: SearchGenreDto;
  query: string;
  onPress?: (genre: SearchGenreDto) => void;
}

function SearchGenreItemBase({ genre, query, onPress }: SearchGenreItemProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.backgroundElement },
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => onPress?.(genre)}
    >
      <View style={[styles.icon, { backgroundColor: theme.backgroundElement }]}>
        <MaterialCommunityIcons name="music-clef-treble" size={20} color={Brand.accent} />
      </View>
      <HighlightText
        text={genre.genre}
        query={query}
        style={[styles.label, { color: theme.text }]}
        highlightStyle={styles.highlight}
        numberOfLines={1}
      />
    </Pressable>
  );
}

export const SearchGenreItem = memo(
  SearchGenreItemBase,
  (prev, next) => prev.genre.id === next.genre.id && prev.query === next.query,
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.label,
    fontWeight: '700',
    flex: 1,
  },
  highlight: {
    color: Brand.accent,
    fontWeight: '800',
  },
});
