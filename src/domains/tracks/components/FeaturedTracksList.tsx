import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { useFeaturedTracks } from '../hooks/use-tracks.hooks';
import { TrackCard } from './TrackCard';
import type { TracksResponseDto } from '../types/tracks.types';

interface FeaturedTracksListProps {
  onTrackPress?: (track: TracksResponseDto) => void;
}

export function FeaturedTracksList({ onTrackPress }: FeaturedTracksListProps) {
  const { data: tracks = [], isLoading } = useFeaturedTracks();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Brand.primary} size="small" />
      </View>
    );
  }

  if (tracks.length === 0) return null;

  return (
    <View>
      <Text style={styles.sectionTitle}>Canciones destacadas</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TrackCard track={item} onPress={onTrackPress} />}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.heading,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
  },
});
