import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { Brand, Typography } from '@/constants/theme';
import { useCreatePlaylist } from '../hooks/use-playlists.hooks';
import type { Playlist } from '../types/playlists.types';
import { isPlanLimitError } from '@/shared/utils/planLimitError';
import { z } from 'zod';

const titleSchema = z.string().min(1, 'El nombre es requerido').max(80, 'Máximo 80 caracteres');

interface CreatePlaylistFormProps {
  onClose: () => void;
  onCreated?: (playlist: Playlist) => void;
}

export function CreatePlaylistForm({ onClose, onCreated }: CreatePlaylistFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const createMutation = useCreatePlaylist();
  const focusProgress = useSharedValue(0);

  const handleFocus = () => {
    focusProgress.value = withTiming(1, { duration: 200 });
  };
  const handleBlur = () => {
    focusProgress.value = withTiming(0, { duration: 200 });
  };

  const restColor = error ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.1)';
  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focusProgress.value, [0, 1], [restColor, Brand.accent]),
  }));

  const handleCreate = () => {
    const result = titleSchema.safeParse(title);
    if (!result.success) {
      const message = result.error.issues[0].message;
      setError(message);
      Toast.show({ type: 'error', text1: message });
      return;
    }
    setError('');
    createMutation.mutate(
      { title: result.data },
      {
        onSuccess: (playlist) => {
          Toast.show({ type: 'success', text1: 'Playlist creada' });
          onCreated?.(playlist);
          onClose();
        },
        onError: (err) => {
          if (!isPlanLimitError(err)) {
            Toast.show({ type: 'error', text1: 'No se pudo crear la playlist' });
          }
        },
      }
    );
  };

  return (
    <View style={styles.form}>
      <Text style={styles.fieldLabel}>Nombre</Text>
      <Animated.View style={[styles.inputWrapper, animatedBorderStyle]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
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
