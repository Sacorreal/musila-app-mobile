import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGenres } from '@/domains/musical-genre/hooks/use-musical-genre.hooks';
import { useLanguages } from '@/domains/tracks/hooks/use-tracks.hooks';
import { Brand, Typography } from '@/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import type { SearchFiltersState } from '../types/search-filters.types';

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onChange: (filters: SearchFiltersState) => void;
}

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function Chip({ label, active, onPress }: ChipProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: active ? Brand.primary : theme.backgroundElement },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipLabel, { color: active ? '#FFFFFF' : theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const { data: genres = [] } = useGenres();
  const { data: languages = [] } = useLanguages();

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined);

  const toggleGenre = (genreId: string) => {
    onChange({ ...filters, genreId: filters.genreId === genreId ? undefined : genreId });
  };

  const toggleGospel = () => {
    onChange({ ...filters, isGospel: filters.isGospel ? undefined : true });
  };

  const toggleLanguage = (code: string) => {
    onChange({ ...filters, language: filters.language === code ? undefined : code });
  };

  const clearFilters = () => onChange({});

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Chip label="Gospel" active={!!filters.isGospel} onPress={toggleGospel} />
        {genres.map((genre) => (
          <Chip
            key={genre.id}
            label={genre.genre}
            active={filters.genreId === genre.id}
            onPress={() => toggleGenre(genre.id)}
          />
        ))}
        {languages.map((language) => (
          <Chip
            key={language.code}
            label={language.label}
            active={filters.language === language.code}
            onPress={() => toggleLanguage(language.code)}
          />
        ))}
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearLabel}>Limpiar filtros</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scroll: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipLabel: {
    ...Typography.caption,
    fontWeight: '700',
  },
  clearButton: {
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  clearLabel: {
    ...Typography.caption,
    color: Brand.primary,
    fontWeight: '700',
  },
});
