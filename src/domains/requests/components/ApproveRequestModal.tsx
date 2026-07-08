import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { Typography } from '@/constants/theme';
import { useUploadStorage } from '@/domains/storage/hooks/use-upload-storage.hooks';
import { StorageFolder } from '@/domains/storage/types/storage.types';
import { useUpdateRequestStatus } from '../hooks/use-requests.hooks';
import { RequestStatus, type TrackRequest } from '../types/requests.types';

interface ApproveRequestModalProps {
  visible: boolean;
  request: TrackRequest | null;
  onClose: () => void;
}

export function ApproveRequestModal({ visible, request, onClose }: ApproveRequestModalProps) {
  const [documentUri, setDocumentUri] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentMimeType, setDocumentMimeType] = useState('');
  const { uploadFiles, isUploading } = useUploadStorage();
  const updateStatus = useUpdateRequestStatus();

  const isSaving = updateStatus.isPending || isUploading;

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setDocumentUri(asset.uri);
      setDocumentName(asset.name);
      setDocumentMimeType(asset.mimeType ?? 'application/pdf');
    }
  };

  const handleClose = () => {
    setDocumentUri('');
    setDocumentName('');
    setDocumentMimeType('');
    onClose();
  };

  const handleApprove = async () => {
    if (!request) return;
    try {
      let documentUrl: string | undefined;
      if (documentUri) {
        const [uploaded] = await uploadFiles([
          { uri: documentUri, mimeType: documentMimeType, folder: StorageFolder.DOCUMENTS, field: 'document' },
        ]);
        documentUrl = uploaded?.publicUrl;
      }

      await updateStatus.mutateAsync({ id: request.id, status: RequestStatus.APROBADA, documentUrl });
      Toast.show({ type: 'success', text1: 'Solicitud aprobada' });
      handleClose();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo aprobar',
        text2: error?.response?.data?.message ?? 'Intenta de nuevo',
      });
    }
  };

  if (!request) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>Aprobar solicitud</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <MaterialCommunityIcons name="close" size={22} color="rgba(255,255,255,0.4)" />
              </Pressable>
            </View>

            <Text style={styles.subtitle} numberOfLines={2}>
              ¿Deseas aprobar la solicitud de &quot;{request.track?.title ?? 'esta canción'}&quot;?
            </Text>

            <Text style={styles.fieldLabel}>Documento de licencia (opcional)</Text>
            <Pressable
              style={({ pressed }) => [
                styles.docPickerBtn,
                !!documentUri && styles.docPickerBtnSelected,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handlePickDocument}
            >
              <MaterialCommunityIcons
                name={documentUri ? 'file-check' : 'paperclip'}
                size={18}
                color={documentUri ? '#4ade80' : 'rgba(255,255,255,0.5)'}
              />
              <Text
                style={[styles.docPickerText, documentUri && styles.docPickerTextSelected]}
                numberOfLines={1}
              >
                {documentName || 'Adjuntar PDF o imagen'}
              </Text>
              {documentUri && (
                <Pressable
                  onPress={() => {
                    setDocumentUri('');
                    setDocumentName('');
                    setDocumentMimeType('');
                  }}
                  hitSlop={8}
                >
                  <MaterialCommunityIcons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
                </Pressable>
              )}
            </Pressable>

            <View style={styles.btnRow}>
              <Pressable style={[styles.btn, styles.btnCancel]} onPress={handleClose}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnApprove]}
                onPress={handleApprove}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnApproveText}>Aprobar</Text>
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
  },
  title: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.6)',
  },
  fieldLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  docPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  docPickerBtnSelected: {
    borderStyle: 'solid',
    borderColor: 'rgba(74,222,128,0.3)',
    backgroundColor: 'rgba(74,222,128,0.05)',
  },
  docPickerText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
  },
  docPickerTextSelected: {
    color: '#4ade80',
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
  btnCancelText: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  btnApprove: {
    backgroundColor: 'rgba(74,222,128,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
  },
  btnApproveText: {
    ...Typography.label,
    color: '#4ade80',
    fontWeight: '700',
  },
});
