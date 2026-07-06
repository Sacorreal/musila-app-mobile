import { Alert, ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { Brand, Typography } from '@/constants/theme';
import { formatFullName } from '@/shared/utils/formatName';
import {
  useRemoveCollaborator,
  usePlaylistCollaborators,
} from '../hooks/use-playlist-collaborators.hooks';
import { CollaboratorPermission, type PlaylistCollaborator } from '../types/playlist-collaborator.types';

const PERMISSION_LABELS: Record<CollaboratorPermission, string> = {
  [CollaboratorPermission.READ]: 'Lector',
  [CollaboratorPermission.WRITE]: 'Editor',
  [CollaboratorPermission.ADMIN]: 'Admin',
};

const PERMISSION_COLORS: Record<CollaboratorPermission, { bg: string; text: string }> = {
  [CollaboratorPermission.READ]: { bg: 'rgba(74,222,128,0.15)', text: '#4ade80' },
  [CollaboratorPermission.WRITE]: { bg: 'rgba(251,191,36,0.15)', text: '#FBB024' },
  [CollaboratorPermission.ADMIN]: { bg: 'rgba(255,80,80,0.15)', text: '#ff5050' },
};

interface PlaylistCollaboratorsSectionProps {
  playlistId: string;
  canManage: boolean;
  onInvitePress: () => void;
}

export function PlaylistCollaboratorsSection({
  playlistId,
  canManage,
  onInvitePress,
}: PlaylistCollaboratorsSectionProps) {
  const { data: collaborators = [], isLoading } = usePlaylistCollaborators(playlistId);
  const removeCollaborator = useRemoveCollaborator();

  if (!canManage && collaborators.length === 0 && !isLoading) return null;

  const handleRemove = (collaborator: PlaylistCollaborator) => {
    Alert.alert(
      'Quitar colaborador',
      `¿Quitar a ${formatFullName(collaborator.guest.name, collaborator.guest.lastName)} de esta playlist?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeCollaborator.mutateAsync({ playlistId, guestId: collaborator.guest.id });
              Toast.show({ type: 'success', text1: 'Colaborador eliminado' });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'No se pudo quitar',
                text2: error?.response?.data?.message ?? 'Intenta de nuevo',
              });
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="account-multiple-outline" size={18} color="rgba(255,255,255,0.6)" />
          <Text style={styles.sectionTitle}>Colaboradores</Text>
          {collaborators.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{collaborators.length}</Text>
            </View>
          )}
        </View>
        {canManage && (
          <Pressable
            style={({ pressed }) => [styles.inviteBtn, pressed && { opacity: 0.7 }]}
            onPress={onInvitePress}
          >
            <MaterialCommunityIcons name="account-plus-outline" size={16} color={Brand.accent} />
            <Text style={styles.inviteBtnText}>Invitar</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={Brand.primary} style={styles.loader} />
      ) : collaborators.length === 0 ? (
        <Text style={styles.emptyText}>Sin colaboradores aún</Text>
      ) : (
        collaborators.map((collaborator) => {
          const colors = PERMISSION_COLORS[collaborator.permission];
          const initials = `${collaborator.guest.name?.[0] ?? ''}${collaborator.guest.lastName?.[0] ?? ''}`.toUpperCase();
          return (
            <View key={collaborator.id} style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || '?'}</Text>
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {formatFullName(collaborator.guest.name, collaborator.guest.lastName)}
              </Text>
              <View style={[styles.permissionBadge, { backgroundColor: colors.bg }]}>
                <Text style={[styles.permissionText, { color: colors.text }]}>
                  {PERMISSION_LABELS[collaborator.permission]}
                </Text>
              </View>
              {canManage && (
                <Pressable
                  style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.6 }]}
                  onPress={() => handleRemove(collaborator)}
                  hitSlop={10}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color="rgba(255,80,80,0.7)" />
                </Pressable>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(60,159,254,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(60,159,254,0.3)',
  },
  inviteBtnText: {
    ...Typography.caption,
    color: Brand.accent,
    fontWeight: '700',
  },
  loader: {
    paddingVertical: 16,
  },
  emptyText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.3)',
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(32,138,239,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(32,138,239,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.accent,
  },
  name: {
    ...Typography.label,
    color: '#FFFFFF',
    flex: 1,
  },
  permissionBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  permissionText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  removeBtn: {
    padding: 2,
  },
});
