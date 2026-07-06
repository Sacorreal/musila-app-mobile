import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';
import { CreatePlaylistForm } from './CreatePlaylistForm';
import type { Playlist } from '../types/playlists.types';

interface CreatePlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (playlist: Playlist) => void;
}

export function CreatePlaylistModal({ visible, onClose, onCreated }: CreatePlaylistModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Nueva playlist</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <MaterialCommunityIcons name="close" size={22} color="rgba(255,255,255,0.4)" />
              </Pressable>
            </View>
            {visible && <CreatePlaylistForm onClose={onClose} onCreated={onCreated} />}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
