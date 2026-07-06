import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import { usePlaylists, useAddTrackToPlaylist } from '@/domains/playlists/hooks/use-playlists.hooks';
import { CreatePlaylistForm } from '@/domains/playlists/components/CreatePlaylistForm';
import type { Playlist } from '@/domains/playlists/types/playlists.types';
import type { TracksResponseDto } from '../types/tracks.types';

const COVER_PLACEHOLDER = require('@/assets/images/icon.png');

interface AddToPlaylistBottomSheetProps {
  visible: boolean;
  track: TracksResponseDto;
  onClose: () => void;
}

export function AddToPlaylistBottomSheet({ visible, track, onClose }: AddToPlaylistBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { data: playlists = [], isLoading } = usePlaylists();
  const addToPlaylist = useAddTrackToPlaylist();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const trackIsInPlaylist = (playlist: Playlist) =>
    (playlist.tracks ?? []).some((t) => t.id === track.id);

  const handleSelect = async (playlist: Playlist) => {
    if (trackIsInPlaylist(playlist)) {
      Toast.show({ type: 'info', text1: `Ya está en "${playlist.title}"` });
      return;
    }
    try {
      await addToPlaylist.mutateAsync({ playlistId: playlist.id, trackId: track.id });
      handleClose();
      Toast.show({ type: 'success', text1: `Agregado a "${playlist.title}"` });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo agregar',
        text2: error?.response?.data?.message ?? 'Intenta de nuevo',
      });
    }
  };

  const handlePlaylistCreated = (playlist: Playlist) => {
    setShowCreateForm(false);
    handleSelect(playlist);
  };

  const handleClose = () => {
    setShowCreateForm(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable style={[styles.sheet, { paddingBottom: 24 + insets.bottom }]}>
            <View style={styles.handle} />

            <View style={styles.sheetHeader}>
              {showCreateForm ? (
                <Pressable onPress={() => setShowCreateForm(false)} hitSlop={12} style={styles.backRow}>
                  <MaterialCommunityIcons name="arrow-left" size={20} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.sheetTitle}>Nueva playlist</Text>
                </Pressable>
              ) : (
                <Text style={styles.sheetTitle}>Agregar a playlist</Text>
              )}
              <Pressable onPress={handleClose} hitSlop={16} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={22} color="rgba(255,255,255,0.6)" />
              </Pressable>
            </View>

            <Text style={styles.trackLabel} numberOfLines={1}>
              "{track.title}"
            </Text>

            {showCreateForm ? (
              <CreatePlaylistForm
                onClose={() => setShowCreateForm(false)}
                onCreated={handlePlaylistCreated}
              />
            ) : isLoading ? (
              <View style={styles.center}>
                <ActivityIndicator color={Brand.primary} />
              </View>
            ) : playlists.length === 0 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="playlist-music-outline" size={36} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>No tienes playlists aún</Text>
                <Pressable
                  style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => setShowCreateForm(true)}
                >
                  <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                  <Text style={styles.createBtnText}>Crear playlist</Text>
                </Pressable>
              </View>
            ) : (
              <FlatList
                data={playlists}
                keyExtractor={(p) => p.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item: playlist }) => {
                  const alreadyAdded = trackIsInPlaylist(playlist);
                  return (
                    <Pressable
                      style={({ pressed }) => [
                        styles.playlistItem,
                        pressed && !alreadyAdded && { opacity: 0.7 },
                        alreadyAdded && styles.playlistItemAdded,
                      ]}
                      onPress={() => handleSelect(playlist)}
                      disabled={addToPlaylist.isPending}
                    >
                      <Image
                        source={playlist.cover ? { uri: playlist.cover } : COVER_PLACEHOLDER}
                        style={styles.playlistCover}
                        contentFit="cover"
                      />
                      <View style={styles.playlistInfo}>
                        <Text style={styles.playlistTitle} numberOfLines={1}>
                          {playlist.title}
                        </Text>
                        {alreadyAdded && <Text style={styles.addedLabel}>Ya agregada</Text>}
                      </View>
                      {addToPlaylist.isPending && addToPlaylist.variables?.playlistId === playlist.id ? (
                        <ActivityIndicator size="small" color={Brand.accent} />
                      ) : (
                        <MaterialCommunityIcons
                          name={alreadyAdded ? 'check-circle' : 'plus-circle-outline'}
                          size={22}
                          color={alreadyAdded ? '#4ade80' : Brand.accent}
                        />
                      )}
                    </Pressable>
                  );
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    maxHeight: '75%',
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
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
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
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Brand.primaryDark,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  createBtnText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    gap: 4,
    paddingBottom: 8,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  playlistItemAdded: {
    opacity: 0.6,
  },
  playlistCover: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  playlistInfo: {
    flex: 1,
    gap: 2,
  },
  playlistTitle: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  addedLabel: {
    ...Typography.caption,
    color: '#4ade80',
  },
});
