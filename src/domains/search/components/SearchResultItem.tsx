import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { resolveGenreName } from '@/domains/tracks/utils/resolveGenreName';
import { HighlightText } from '@/shared/components/HighlightText';
import { useTheme } from '@/shared/hooks/use-theme';
import { formatFullName } from '@/shared/utils/formatName';
import type { SearchResult } from '../types/search.types';

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  onPress?: (result: SearchResult) => void;
}

const COVER_SIZE = 48;
const PLACEHOLDER = require('@/assets/images/icon.png');

function SearchResultItemBase({ result, query, onPress }: SearchResultItemProps) {
  const theme = useTheme();

  const authorLabel = Array.isArray(result.authors)
    ? result.authors
        .map((a) => (typeof a === 'string' ? a : formatFullName(a.name, a.lastName)))
        .join(', ')
    : '';

  const genreName = resolveGenreName(result.genre);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.backgroundElement },
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => onPress?.(result)}
    >
      <Image
        source={result.coverUrl ? { uri: result.coverUrl } : PLACEHOLDER}
        style={[styles.cover, { backgroundColor: theme.backgroundElement }]}
        contentFit="cover"
      />
      <View style={styles.info}>
        <HighlightText
          text={result.title}
          query={query}
          style={[styles.title, { color: theme.text }]}
          highlightStyle={styles.highlight}
          numberOfLines={1}
        />
        {!!authorLabel && (
          <Text style={[styles.author, { color: theme.textSecondary }]} numberOfLines={1}>
            {authorLabel}
          </Text>
        )}
        {!!genreName && (
          <Text style={[styles.genre, { color: theme.textSecondary }]} numberOfLines={1}>
            {genreName}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export const SearchResultItem = memo(
  SearchResultItemBase,
  (prev, next) => prev.result.id === next.result.id && prev.query === next.query,
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 8,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    ...Typography.label,
    fontWeight: '700',
  },
  highlight: {
    color: Brand.primary,
    fontWeight: '800',
  },
  author: {
    ...Typography.caption,
  },
  genre: {
    ...Typography.caption,
    opacity: 0.7,
  },
});
