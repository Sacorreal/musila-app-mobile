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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import { useGuests } from '@/domains/guests/hooks/use-guests.hooks';
import { formatFullName } from '@/shared/utils/formatName';
import { useAddCollaborators } from '../hooks/use-playlist-collaborators.hooks';
import { CollaboratorPermission } from '../types/playlist-collaborator.types';
import { InviteGuestPanel } from './InviteGuestPanel';

const PERMISSION_OPTIONS: { value: CollaboratorPermission; label: string }[] = [
  { value: CollaboratorPermission.READ, label: 'Lector' },
  { value: CollaboratorPermission.WRITE, label: 'Editor' },
  { value: CollaboratorPermission.ADMIN, label: 'Admin' },
];

interface AddCollaboratorsBottomSheetProps {
  visible: boolean;
  playlistId: string;
  existingCollaboratorGuestIds: string[];
  onClose: () => void;
}

export function AddCollaboratorsBottomSheet({
  visible,
  playlistId,
  existingCollaboratorGuestIds,
  onClose,
}: AddCollaboratorsBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { data: guestsResponse, isLoading } = useGuests();
  const addCollaborators = useAddCollaborators();
  const [mode, setMode] = useState<'picker' | 'invite'>('picker');
  const [selected, setSelected] = useState<Record<string, CollaboratorPermission>>({});

  const availableGuests = (guestsResponse?.data ?? []).filter(
    (g) => !existingCollaboratorGuestIds.includes(g.id),
  );

  const selectedCount = Object.keys(selected).length;

  const handleClose = () => {
    setMode('picker');
    setSelected({});
    onClose();
  };

  const toggleGuest = (guestId: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[guestId]) {
        delete next[guestId];
      } else {
        next[guestId] = CollaboratorPermission.READ;
      }
      return next;
    });
  };

  const setGuestPermission = (guestId: string, permission: CollaboratorPermission) => {
    setSelected((prev) => ({ ...prev, [guestId]: permission }));
  };

  const handleSubmit = async () => {
    const collaborators = Object.entries(selected).map(([guestId, permission]) => ({
      guestId,
      permission,
    }));
    if (collaborators.length === 0) return;
    try {
      const result = await addCollaborators.mutateAsync({ playlistId, data: { collaborators } });
      if (result.length < collaborators.length) {
        Toast.show({
          type: 'info',
          text1: `Se agregaron ${result.length} de ${collaborators.length} colaboradores`,
        });
      } else {
        Toast.show({ type: 'success', text1: 'Colaboradores agregados' });
      }
      handleClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo agregar',
        text2: error?.response?.data?.message ?? 'Intenta de nuevo',
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable style={[styles.sheet, { paddingBottom: 24 + insets.bottom }]}>
            <View style={styles.handle} />

            <View style={styles.sheetHeader}>
              {mode === 'invite' ? (
                <Pressable onPress={() => setMode('picker')} hitSlop={12} style={styles.backRow}>
                  <MaterialCommunityIcons name="arrow-left" size={20} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.sheetTitle}>Nueva invitación</Text>
                </Pressable>
              ) : (
                <Text style={styles.sheetTitle}>
                  Agregar colaboradores {selectedCount > 0 ? `(${selectedCount})` : ''}
                </Text>
              )}
              <Pressable onPress={handleClose} hitSlop={16} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={22} color="rgba(255,255,255,0.6)" />
              </Pressable>
            </View>

            {mode === 'invite' ? (
              <InviteGuestPanel onBack={() => setMode('picker')} />
            ) : isLoading ? (
              <View style={styles.center}>
                <ActivityIndicator color={Brand.primary} />
              </View>
            ) : availableGuests.length === 0 ? (
              <View style={styles.empty}>
                <MaterialCommunityIcons name="account-multiple-outline" size={36} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>No tienes invitados disponibles</Text>
                <Pressable
                  style={({ pressed }) => [styles.inviteCreateBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => setMode('invite')}
                >
                  <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                  <Text style={styles.inviteCreateBtnText}>Generar invitación</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Pressable style={styles.inviteMoreRow} onPress={() => setMode('invite')}>
                  <MaterialCommunityIcons name="plus-circle-outline" size={16} color={Brand.accent} />
                  <Text style={styles.inviteMoreText}>Generar invitación</Text>
                </Pressable>
                <FlatList
                  data={availableGuests}
                  keyExtractor={(g) => g.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                  renderItem={({ item: guest }) => {
                    const isSelected = !!selected[guest.id];
                    return (
                      <View style={styles.guestItem}>
                        <Pressable
                          style={styles.guestRow}
                          onPress={() => toggleGuest(guest.id)}
                        >
                          <MaterialCommunityIcons
                            name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                            size={22}
                            color={isSelected ? Brand.accent : 'rgba(255,255,255,0.3)'}
                          />
                          <Text style={styles.guestName} numberOfLines={1}>
                            {formatFullName(guest.name, guest.lastName)}
                          </Text>
                        </Pressable>
                        {isSelected && (
                          <View style={styles.permissionRow}>
                            {PERMISSION_OPTIONS.map((opt) => {
                              const active = selected[guest.id] === opt.value;
                              return (
                                <Pressable
                                  key={opt.value}
                                  style={[styles.permissionChip, active && styles.permissionChipActive]}
                                  onPress={() => setGuestPermission(guest.id, opt.value)}
                                >
                                  <Text
                                    style={[
                                      styles.permissionChipText,
                                      active && styles.permissionChipTextActive,
                                    ]}
                                  >
                                    {opt.label}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  }}
                />
                <Pressable
                  style={[styles.submitBtn, selectedCount === 0 && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={selectedCount === 0 || addCollaborators.isPending}
                >
                  {addCollaborators.isPending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      Agregar {selectedCount} colaborador{selectedCount === 1 ? '' : 'es'}
                    </Text>
                  )}
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
    maxHeight: '80%',
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
  inviteCreateBtn: {
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
  inviteCreateBtnText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inviteMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  inviteMoreText: {
    ...Typography.caption,
    color: Brand.accent,
    fontWeight: '700',
  },
  listContent: {
    gap: 4,
    paddingBottom: 8,
  },
  guestItem: {
    paddingVertical: 6,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  guestName: {
    ...Typography.label,
    color: '#FFFFFF',
    flex: 1,
  },
  permissionRow: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 34,
    marginTop: 4,
    marginBottom: 4,
  },
  permissionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  permissionChipActive: {
    backgroundColor: 'rgba(32,138,239,0.15)',
    borderColor: `${Brand.primary}60`,
  },
  permissionChipText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  permissionChipTextActive: {
    color: Brand.accent,
  },
  submitBtn: {
    backgroundColor: Brand.primaryDark,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
