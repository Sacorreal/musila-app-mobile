import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { useGenres } from '../hooks/use-musical-genre.hooks';
import { GenreChip } from './GenreChip';
import type { MusicalGenreDto } from '../types/musical-genre.types';

interface GenreRowProps {
  onGenrePress?: (genre: MusicalGenreDto) => void;
}

export function GenreRow({ onGenrePress }: GenreRowProps) {
  const { data: genres = [], isLoading } = useGenres();

  return (
    <View>
      <Text style={styles.sectionTitle}>Géneros</Text>
      {isLoading ? (
        <ActivityIndicator color={Brand.primary} style={styles.loader} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {genres.map((g) => (
            <GenreChip key={g.id} genre={g} onPress={onGenrePress} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...Typography.heading,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    paddingBottom: 4,
  },
  loader: {
    paddingVertical: 16,
  },
});
