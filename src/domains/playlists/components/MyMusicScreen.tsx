import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { UserRole } from '@/domains/users/types/users.types';
import { usePlaylists } from '@/domains/playlists/hooks/use-playlists.hooks';
import { PlaylistCard } from '@/domains/playlists/components/PlaylistCard';
import { CreatePlaylistModal } from '@/domains/playlists/components/CreatePlaylistModal';
import { useMyTracks } from '@/domains/tracks/hooks/use-tracks.hooks';
import { TrackCard } from '@/domains/tracks/components/TrackCard';
import type { Playlist } from '@/domains/playlists/types/playlists.types';

export function MyMusicScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: playlists = [], isLoading: loadingPlaylists } = usePlaylists();
  const { data: myTracks = [], isLoading: loadingTracks } = useMyTracks();

  const canCreatePlaylist = user?.role !== UserRole.INVITADO;

  const handlePlaylistPress = (_playlist: Playlist) => {
    // Navegación futura al detalle de la playlist
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.bgOrb} pointerEvents="none" />

      <ReAnimated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
        <Text style={styles.title}>Mi Música</Text>
        {canCreatePlaylist && (
          <Pressable style={styles.addBtn} onPress={() => setShowCreateModal(true)}>
            <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
          </Pressable>
        )}
      </ReAnimated.View>

      <ReAnimated.View entering={FadeInDown.delay(120).springify()}>
        <Text style={styles.sectionTitle}>Mis Playlists</Text>
        {loadingPlaylists ? (
          <ActivityIndicator color={Brand.primary} style={styles.loader} />
        ) : playlists.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyIcon}>🎵</Text>
            <Text style={styles.emptyText}>Sin playlists aún</Text>
            {canCreatePlaylist && (
              <Text style={styles.emptyHint}>Toca el botón + para crear una</Text>
            )}
          </View>
        ) : (
          <FlatList
            data={playlists}
            keyExtractor={(p) => p.id}
            numColumns={2}
            renderItem={({ item }) => (
              <PlaylistCard playlist={item} onPress={handlePlaylistPress} />
            )}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
          />
        )}
      </ReAnimated.View>

      <ReAnimated.View entering={FadeInDown.delay(240).springify()} style={styles.tracksSection}>
        <Text style={styles.sectionTitle}>Mis Canciones</Text>
        {loadingTracks ? (
          <ActivityIndicator color={Brand.primary} style={styles.loader} />
        ) : myTracks.length === 0 ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyIcon}>🎶</Text>
            <Text style={styles.emptyText}>Sin canciones guardadas</Text>
          </View>
        ) : (
          <FlatList
            data={myTracks}
            keyExtractor={(t) => t.id}
            renderItem={({ item }) => <TrackCard track={item} />}
            scrollEnabled={false}
          />
        )}
      </ReAnimated.View>

      <CreatePlaylistModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  bgOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(32,138,239,0.06)',
    top: -80,
    right: -80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    ...Typography.display,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Brand.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  sectionTitle: {
    ...Typography.heading,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 14,
  },
  loader: {
    paddingVertical: 20,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  emptyText: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  emptyHint: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.3)',
  },
  gridRow: {
    marginBottom: 2,
  },
  tracksSection: {
    marginTop: 16,
  },
});
