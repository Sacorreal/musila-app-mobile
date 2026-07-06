import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';
import { HighlightText } from '@/shared/components/HighlightText';
import { useTheme } from '@/shared/hooks/use-theme';
import { formatFullName } from '@/shared/utils/formatName';
import type { SearchAuthorDto } from '../types/search.types';

const AVATAR_SIZE = 44;

interface SearchAuthorItemProps {
  author: SearchAuthorDto;
  query: string;
  onPress?: (author: SearchAuthorDto) => void;
}

function SearchAuthorItemBase({ author, query, onPress }: SearchAuthorItemProps) {
  const theme = useTheme();
  const fullName = formatFullName(author.name, author.lastName);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.backgroundElement },
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => onPress?.(author)}
    >
      {author.avatarUrl ? (
        <Image
          source={{ uri: author.avatarUrl }}
          style={[styles.avatar, { backgroundColor: theme.backgroundElement }]}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.backgroundElement }]}>
          <MaterialCommunityIcons name="account-music" size={22} color={theme.textSecondary} />
        </View>
      )}
      <View style={styles.info}>
        <HighlightText
          text={fullName}
          query={query}
          style={[styles.name, { color: theme.text }]}
          highlightStyle={styles.highlight}
          numberOfLines={1}
        />
        <Text style={[styles.role, { color: theme.textSecondary }]} numberOfLines={1}>
          Autor
        </Text>
      </View>
    </Pressable>
  );
}

export const SearchAuthorItem = memo(
  SearchAuthorItemBase,
  (prev, next) => prev.author.id === next.author.id && prev.query === next.query,
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    ...Typography.label,
    fontWeight: '700',
  },
  highlight: {
    color: '#3C9FFE',
    fontWeight: '800',
  },
  role: {
    ...Typography.caption,
  },
});
