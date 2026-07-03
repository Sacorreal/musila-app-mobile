import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { useFeaturedArtists } from '../hooks/use-artists.hooks';
import { ArtistAvatar } from './ArtistAvatar';
import type { ArtistDto } from '../types/artists.types';

interface ArtistsRowProps {
  onArtistPress?: (artist: ArtistDto) => void;
}

export function ArtistsRow({ onArtistPress }: ArtistsRowProps) {
  const { data: artists = [], isLoading } = useFeaturedArtists();

  if (isLoading) {
    return (
      <View>
        <Text style={styles.sectionTitle}>Compositores Destacados</Text>
        <ActivityIndicator color={Brand.primary} style={styles.loader} />
      </View>
    );
  }

  if (artists.length === 0) return null;

  return (
    <View>
      <Text style={styles.sectionTitle}>Compositores Destacados</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {artists.map((a) => (
          <ArtistAvatar key={a.id} artist={a} onPress={onArtistPress} />
        ))}
      </ScrollView>
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
