import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { useMyAuthorTracks } from '../hooks/use-tracks.hooks';
import { TrackCard } from './TrackCard';
import type { TracksResponseDto } from '../types/tracks.types';

interface MyTracksListProps {
  onTrackPress?: (track: TracksResponseDto) => void;
}

export function MyTracksList({ onTrackPress }: MyTracksListProps) {
  const { data: tracks = [], isLoading } = useMyAuthorTracks();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Brand.primary} size="large" />
      </View>
    );
  }

  if (tracks.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🎵</Text>
        <Text style={styles.emptyTitle}>Sin canciones aún</Text>
        <Text style={styles.emptySubtitle}>Publica tu primera canción en la tab Publicar</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Mis canciones</Text>
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
    paddingVertical: 32,
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptySubtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    ...Typography.heading,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
  },
});
