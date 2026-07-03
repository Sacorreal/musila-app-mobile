import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';
import { resolveGenreName } from '@/domains/tracks/utils/resolveGenreName';
import type { SearchResult } from '../types/search.types';

interface SearchResultItemProps {
  result: SearchResult;
  onPress?: (result: SearchResult) => void;
}

const COVER_SIZE = 48;
const PLACEHOLDER = require('@/assets/images/icon.png');

export function SearchResultItem({ result, onPress }: SearchResultItemProps) {
  const authorLabel = Array.isArray(result.authors)
    ? result.authors
        .map((a) => (typeof a === 'string' ? a : `${a.name} ${a.lastName}`))
        .join(', ')
    : '';

  const genreName = resolveGenreName(result.genre);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      onPress={() => onPress?.(result)}
    >
      <Image
        source={result.coverUrl ? { uri: result.coverUrl } : PLACEHOLDER}
        style={styles.cover}
        contentFit="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {result.title}
        </Text>
        {!!authorLabel && (
          <Text style={styles.author} numberOfLines={1}>
            {authorLabel}
          </Text>
        )}
        {!!genreName && (
          <Text style={styles.genre} numberOfLines={1}>
            {genreName}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  author: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.5)',
  },
  genre: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.3)',
  },
});
