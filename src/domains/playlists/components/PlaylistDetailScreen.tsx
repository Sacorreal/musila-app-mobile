import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ReAnimated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { Brand, Typography } from '@/constants/theme';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { UserRole } from '@/domains/users/types/users.types';
import { playTracks } from '@/domains/player/utils/playQueue';
import { HomeButton } from '@/shared/components/ui/HomeButton';
import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';
import {
  usePlaylistById,
  useDeletePlaylist,
  useRemoveTrackFromPlaylist,
} from '../hooks/use-playlists.hooks';
import { CollaboratorPermission } from '../types/playlist-collaborator.types';
import { PlaylistTrackRow } from './PlaylistTrackRow';
import { PlaylistCollaboratorsSection } from './PlaylistCollaboratorsSection';
import { AddCollaboratorsBottomSheet } from './AddCollaboratorsBottomSheet';
import { EditPlaylistModal } from './EditPlaylistModal';

const COVER_PLACEHOLDER = require('@/assets/images/icon.png');

export function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.id);
  const role = useAuthStore((s) => s.user?.role);

  const { data: playlist, isLoading, isError, isRefetching, refetch } = usePlaylistById(id ?? '');
  const deletePlaylist = useDeletePlaylist();
  const removeTrack = useRemoveTrackFromPlaylist();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteSheet, setShowInviteSheet] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <View style={styles.bgOrb1} pointerEvents="none" />
        <View style={styles.bgOrb2} pointerEvents="none" />
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonCover} />
        <View style={styles.skeletonLine} />
        <ActivityIndicator color={Brand.primary} style={{ marginTop: 32 }} />
      </View>
    );
  }

  if (isError || !playlist) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Pressable
          style={[styles.backBtn, { position: 'absolute', top: insets.top + 12, left: 20 }]}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={{ position: 'absolute', top: insets.top + 12, right: 20 }}>
          <HomeButton />
        </View>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.2)" />
        <Text style={styles.errorTitle}>No se pudo cargar la playlist</Text>
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const tracks = playlist.tracks ?? [];
  const isSystemAdmin = role === UserRole.ADMIN;
  const isOwner = playlist.owner?.id === userId;
  const collabPermission = playlist.collaborators?.find((c) => c.guest.id === userId)?.permission;
  const canEdit =
    isSystemAdmin || isOwner || collabPermission === CollaboratorPermission.WRITE || collabPermission === CollaboratorPermission.ADMIN;
  const canDeletePlaylist = isSystemAdmin || isOwner || collabPermission === CollaboratorPermission.ADMIN;
  const canManageCollaborators = isSystemAdmin || isOwner;

  const roleBadgeLabel = isOwner
    ? null
    : collabPermission === CollaboratorPermission.ADMIN
      ? 'Colaborador · Admin'
      : collabPermission === CollaboratorPermission.WRITE
        ? 'Colaborador · Editor'
        : 'Colaborador · Lector';

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    playTracks(tracks, 0);
  };

  const handleTrackPress = (track: TracksResponseDto, index: number) => {
    playTracks(tracks, index);
  };

  const handleTrackNavigate = (track: TracksResponseDto) => {
    router.push({ pathname: '/tracks/[id]', params: { id: track.id } });
  };

  const handleRemoveTrack = (track: TracksResponseDto) => {
    Alert.alert('Quitar de la playlist', `¿Quitar "${track.title}" de esta playlist?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeTrack.mutateAsync({ playlistId: playlist.id, trackId: track.id });
            Toast.show({ type: 'success', text1: 'Canción quitada' });
          } catch (error: any) {
            Toast.show({
              type: 'error',
              text1: 'No se pudo quitar',
              text2: error?.response?.data?.message ?? 'Intenta de nuevo',
            });
          }
        },
      },
    ]);
  };

  const handleDeletePlaylist = () => {
    Alert.alert(
      'Eliminar playlist',
      `¿Eliminar "${playlist.title}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlaylist.mutateAsync(playlist.id);
              Toast.show({ type: 'success', text1: 'Playlist eliminada' });
              router.back();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'No se pudo eliminar',
                text2: error?.response?.data?.message ?? 'Intenta de nuevo',
              });
            }
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Brand.primary} colors={[Brand.primary]} />
        }
      >
        <View style={styles.bgOrb1} pointerEvents="none" />
        <View style={styles.bgOrb2} pointerEvents="none" />

        {/* Header */}
        <ReAnimated.View entering={FadeIn.duration(200)} style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {playlist.title}
          </Text>
          {canEdit && (
            <Pressable
              style={({ pressed }) => [styles.editIconBtn, pressed && { opacity: 0.6 }]}
              onPress={() => setShowEditModal(true)}
              hitSlop={12}
            >
              <MaterialCommunityIcons name="pencil-outline" size={20} color={Brand.accent} />
            </Pressable>
          )}
          <HomeButton />
        </ReAnimated.View>

        {/* Cover */}
        <ReAnimated.View entering={FadeInDown.delay(60).springify()} style={styles.coverWrapper}>
          <View style={styles.coverBox}>
            <Image
              source={playlist.cover ? { uri: playlist.cover } : COVER_PLACEHOLDER}
              style={styles.cover}
              contentFit="cover"
            />
            <Pressable
              style={({ pressed }) => [
                styles.playFab,
                tracks.length === 0 && styles.playFabDisabled,
                pressed && { transform: [{ scale: 0.94 }] },
              ]}
              onPress={handlePlayAll}
              disabled={tracks.length === 0}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="play" size={26} color="#FFFFFF" style={styles.playFabIconOffset} />
            </Pressable>
          </View>
        </ReAnimated.View>

        {/* Meta */}
        <ReAnimated.View entering={FadeInDown.delay(120).springify()} style={styles.meta}>
          <Text style={styles.title}>{playlist.title}</Text>
          <Text style={styles.subtitle}>
            {tracks.length} {tracks.length === 1 ? 'canción' : 'canciones'}
          </Text>
          {!!roleBadgeLabel && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{roleBadgeLabel}</Text>
            </View>
          )}
        </ReAnimated.View>

        {/* Secondary actions */}
        {(canEdit || canDeletePlaylist) && (
          <ReAnimated.View entering={FadeInDown.delay(160).springify()} style={styles.actions}>
            {canEdit && (
              <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                onPress={() => setShowEditModal(true)}
              >
                <MaterialCommunityIcons name="pencil-outline" size={20} color={Brand.accent} />
                <Text style={styles.actionBtnText}>Editar</Text>
              </Pressable>
            )}
            {canDeletePlaylist && (
              <Pressable
                style={({ pressed }) => [styles.actionBtn, styles.actionBtnDanger, pressed && { opacity: 0.7 }]}
                onPress={handleDeletePlaylist}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ff5050" />
                <Text style={[styles.actionBtnText, styles.actionBtnTextDanger]}>Eliminar playlist</Text>
              </Pressable>
            )}
          </ReAnimated.View>
        )}

        {/* Collaborators */}
        <ReAnimated.View entering={FadeInDown.delay(200).springify()}>
          <PlaylistCollaboratorsSection
            playlistId={playlist.id}
            canManage={canManageCollaborators}
            onInvitePress={() => setShowInviteSheet(true)}
          />
        </ReAnimated.View>

        {/* Tracks */}
        <ReAnimated.View entering={FadeInDown.delay(240).springify()}>
          <Text style={styles.sectionTitle}>Canciones ({tracks.length})</Text>
          {tracks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🎵</Text>
              <Text style={styles.emptyTitle}>Sin canciones en esta playlist</Text>
              {canEdit && (
                <Text style={styles.emptyHint}>
                  Agrega canciones desde el detalle de cada track
                </Text>
              )}
            </View>
          ) : (
            tracks.map((track, index) => (
              <PlaylistTrackRow
                key={track.id}
                track={track}
                onPress={() => {
                  handleTrackPress(track, index);
                  handleTrackNavigate(track);
                }}
                onRemove={canEdit ? () => handleRemoveTrack(track) : undefined}
              />
            ))
          )}
        </ReAnimated.View>
      </ScrollView>

      <AddCollaboratorsBottomSheet
        visible={showInviteSheet}
        playlistId={playlist.id}
        existingCollaboratorGuestIds={(playlist.collaborators ?? []).map((c) => c.guest.id)}
        onClose={() => setShowInviteSheet(false)}
      />

      <EditPlaylistModal
        visible={showEditModal}
        playlist={playlist}
        onClose={() => setShowEditModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  center: {
    flex: 1,
    backgroundColor: '#080B12',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  bgOrb1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(32,138,239,0.07)',
    top: -80,
    right: -100,
  },
  bgOrb2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(60,159,254,0.05)',
    bottom: 200,
    left: -60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
    fontWeight: '600',
  },
  editIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(60,159,254,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  coverWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  coverBox: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  cover: {
    width: 260,
    height: 260,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
  },
  playFab: {
    position: 'absolute',
    bottom: -14,
    left: -14,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.primaryDark,
    // @ts-ignore
    experimental_backgroundImage: `linear-gradient(135deg, ${Brand.primaryDark}, ${Brand.accent})`,
    borderWidth: 3,
    borderColor: '#080B12',
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  playFabDisabled: {
    opacity: 0.4,
  },
  playFabIconOffset: {
    marginLeft: 3,
  },
  meta: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  title: {
    ...Typography.heading,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
  },
  roleBadge: {
    marginTop: 6,
    backgroundColor: 'rgba(32,138,239,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  roleBadgeText: {
    ...Typography.caption,
    color: Brand.accent,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(60,159,254,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(60,159,254,0.25)',
  },
  actionBtnDanger: {
    backgroundColor: 'rgba(255,80,80,0.08)',
    borderColor: 'rgba(255,80,80,0.25)',
  },
  actionBtnText: {
    ...Typography.label,
    color: Brand.accent,
    fontWeight: '600',
  },
  actionBtnTextDanger: {
    color: '#ff5050',
  },
  sectionTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 14,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyHint: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(32,138,239,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(32,138,239,0.3)',
  },
  retryText: {
    ...Typography.label,
    color: Brand.accent,
    fontWeight: '600',
  },
  skeletonHeader: {
    width: '70%',
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginBottom: 24,
  },
  skeletonCover: {
    width: 260,
    height: 260,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginBottom: 20,
  },
  skeletonLine: {
    width: '80%',
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 10,
  },
});
