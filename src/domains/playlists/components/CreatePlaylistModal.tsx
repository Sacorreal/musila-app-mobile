import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Brand, Typography } from '@/constants/theme';
import { useCreatePlaylist } from '../hooks/use-playlists.hooks';
import { z } from 'zod';

const titleSchema = z.string().min(1, 'El nombre es requerido').max(80, 'Máximo 80 caracteres');

interface CreatePlaylistModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreatePlaylistModal({ visible, onClose }: CreatePlaylistModalProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const createMutation = useCreatePlaylist();
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setTitle('');
      setError('');
    }
  }, [visible]);

  const handleFocus = () =>
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const handleBlur = () =>
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.1)', Brand.accent],
  });

  const handleCreate = () => {
    const result = titleSchema.safeParse(title);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    setError('');
    createMutation.mutate(
      { title: result.data },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Playlist creada' });
          onClose();
        },
        onError: () => {
          Toast.show({ type: 'error', text1: 'No se pudo crear la playlist' });
        },
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.modalTitle}>Nueva playlist</Text>
          <Text style={styles.fieldLabel}>Nombre</Text>
          <Animated.View style={[styles.inputWrapper, { borderColor }]}>
            <TextInput
              style={styles.input}
              placeholder="Ej. Mis favoritas"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={title}
              onChangeText={(t) => { setTitle(t); setError(''); }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoFocus
              maxLength={80}
              selectionColor={Brand.accent}
            />
          </Animated.View>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.btnRow}>
            <Pressable style={[styles.btn, styles.btnCancel]} onPress={onClose}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnCreate]}
              onPress={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnCreateText}>Crear</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 24,
    gap: 12,
  },
  modalTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  fieldLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    height: 50,
    justifyContent: 'center',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  errorText: {
    ...Typography.caption,
    color: 'rgba(255,85,85,0.9)',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
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
  btnCreate: {
    backgroundColor: Brand.primaryDark,
  },
  btnCancelText: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  btnCreateText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
