import { Pressable, StyleSheet, Text } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import type { MusicalGenreDto } from '../types/musical-genre.types';

interface GenreChipProps {
  genre: MusicalGenreDto;
  onPress?: (genre: MusicalGenreDto) => void;
}

export function GenreChip({ genre, onPress }: GenreChipProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
      onPress={() => onPress?.(genre)}
    >
      <Text style={styles.label}>{genre.genre}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: 'rgba(32,138,239,0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${Brand.primary}40`,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(32,138,239,0.25)',
  },
  label: {
    ...Typography.caption,
    color: Brand.accent,
    fontWeight: '600',
  },
});
