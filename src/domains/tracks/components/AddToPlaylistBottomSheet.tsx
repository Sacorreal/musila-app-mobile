import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import ReAnimated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { Brand, Typography } from '@/constants/theme';
import { usePlaylists, useAddTrackToPlaylist } from '@/domains/playlists/hooks/use-playlists.hooks';
import type { Playlist } from '@/domains/playlists/types/playlists.types';
import type { TracksResponseDto } from '../types/tracks.types';

const COVER_PLACEHOLDER = require('@/assets/images/icon.png');

interface AddToPlaylistBottomSheetProps {
  visible: boolean;
  track: TracksResponseDto;
  onClose: () => void;
}

export function AddToPlaylistBottomSheet({ visible, track, onClose }: AddToPlaylistBottomSheetProps) {
  const { data: playlists = [], isLoading } = usePlaylists();
  const addToPlaylist = useAddTrackToPlaylist();

  const handleSelect = async (playlist: Playlist) => {
    try {
      await addToPlaylist.mutateAsync({ playlistId: playlist.id, trackId: track.id });
      onClose();
      Toast.show({ type: 'success', text1: `Agregado a "${playlist.title}"` });
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo agregar', text2: 'Intenta de nuevo' });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <ReAnimated.View entering={FadeIn.duration(180)} style={styles.backdrop}>
        <Pressable style={styles.backdropPress} onPress={onClose} />
        <ReAnimated.View
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.duration(220)}
          style={styles.sheet}
        >
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Agregar a playlist</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <MaterialCommunityIcons name="close" size={22} color="rgba(255,255,255,0.4)" />
            </Pressable>
          </View>

          <Text style={styles.trackLabel} numberOfLines={1}>
            "{track.title}"
          </Text>

          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={Brand.primary} />
            </View>
          ) : playlists.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="playlist-music-outline" size={36} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>No tienes playlists aún</Text>
            </View>
          ) : (
            <FlatList
              data={playlists}
              keyExtractor={(p) => p.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item: playlist }) => {
                const isProcessing = addToPlaylist.isPending;
                return (
                  <Pressable
                    style={({ pressed }) => [styles.playlistItem, pressed && { opacity: 0.7 }]}
                    onPress={() => handleSelect(playlist)}
                    disabled={isProcessing}
                  >
                    <Image
                      source={playlist.cover ? { uri: playlist.cover } : COVER_PLACEHOLDER}
                      style={styles.playlistCover}
                      contentFit="cover"
                    />
                    <Text style={styles.playlistTitle} numberOfLines={1}>
                      {playlist.title}
                    </Text>
                    <MaterialCommunityIcons
                      name="plus-circle-outline"
                      size={22}
                      color={Brand.accent}
                    />
                  </Pressable>
                );
              }}
            />
          )}
        </ReAnimated.View>
      </ReAnimated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  sheetTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  trackLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  center: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.3)',
  },
  listContent: {
    gap: 4,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  playlistCover: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  playlistTitle: {
    ...Typography.label,
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '500',
  },
});
