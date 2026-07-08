import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { z } from 'zod';
import { Brand, Typography } from '@/constants/theme';
import { CoverPickerField } from '@/domains/tracks/components/CoverPickerField';
import { useUploadStorage } from '@/domains/storage/hooks/use-upload-storage.hooks';
import { StorageFolder } from '@/domains/storage/types/storage.types';
import { useUpdatePlaylist } from '../hooks/use-playlists.hooks';
import type { Playlist } from '../types/playlists.types';

const titleSchema = z.string().min(1, 'El nombre es requerido').max(80, 'Máximo 80 caracteres');

interface EditPlaylistModalProps {
  visible: boolean;
  playlist: Playlist;
  onClose: () => void;
}

export function EditPlaylistModal({ visible, playlist, onClose }: EditPlaylistModalProps) {
  const [title, setTitle] = useState(playlist.title);
  const [coverUri, setCoverUri] = useState(playlist.cover ?? '');
  const [coverMimeType, setCoverMimeType] = useState('image/jpeg');
  const [error, setError] = useState('');
  const [prevVisible, setPrevVisible] = useState(visible);
  const updatePlaylist = useUpdatePlaylist();
  const { uploadFiles, isUploading } = useUploadStorage();

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setTitle(playlist.title);
      setCoverUri(playlist.cover ?? '');
      setError('');
    }
  }

  const isSaving = updatePlaylist.isPending || isUploading;

  const handleSave = async () => {
    const result = titleSchema.safeParse(title);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError('');

    try {
      let coverPayload: string | undefined;
      if (coverUri && coverUri.startsWith('file')) {
        const [uploaded] = await uploadFiles([
          { uri: coverUri, mimeType: coverMimeType, folder: StorageFolder.COVERS, field: 'cover' },
        ]);
        coverPayload = uploaded?.publicUrl;
      } else if (!coverUri && playlist.cover) {
        coverPayload = '';
      }

      await updatePlaylist.mutateAsync({
        id: playlist.id,
        input: {
          title: result.data,
          ...(coverPayload !== undefined ? { cover: coverPayload } : {}),
        },
      });
      Toast.show({ type: 'success', text1: 'Playlist actualizada' });
      onClose();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo actualizar',
        text2: err?.response?.data?.message ?? 'Intenta de nuevo',
      });
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Editar playlist</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <MaterialCommunityIcons name="close" size={22} color="rgba(255,255,255,0.4)" />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" style={styles.scroll}>
              <Text style={styles.fieldLabel}>Nombre</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={(t) => { setTitle(t); setError(''); }}
                  placeholder="Ej. Mis favoritas"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  maxLength={80}
                  selectionColor={Brand.accent}
                />
              </View>
              {!!error && <Text style={styles.errorText}>{error}</Text>}

              <CoverPickerField
                uri={coverUri}
                onPick={(uri, mimeType) => {
                  setCoverUri(uri);
                  setCoverMimeType(mimeType);
                }}
                onClear={() => setCoverUri('')}
              />
            </ScrollView>

            <View style={styles.btnRow}>
              <Pressable style={[styles.btn, styles.btnCancel]} onPress={onClose}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnSave]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnSaveText}>Guardar</Text>
                )}
              </Pressable>
            </View>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 24,
  },
  scroll: {
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fieldLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    height: 50,
    justifyContent: 'center',
    marginBottom: 8,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  errorText: {
    ...Typography.caption,
    color: 'rgba(255,85,85,0.9)',
    marginBottom: 8,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  btnCancelText: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  btnSave: {
    backgroundColor: Brand.primaryDark,
  },
  btnSaveText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
