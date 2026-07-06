import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Brand, Typography } from '@/constants/theme';
import { useCreateRequest, useRequests } from '@/domains/requests/hooks/use-requests.hooks';
import { RequestStatus } from '@/domains/requests/types/requests.types';
import { LicenseType } from '../types/tracks.types';
import type { TracksResponseDto } from '../types/tracks.types';

const LICENSE_LABELS: Record<LicenseType, string> = {
  [LicenseType.LICENCIA_DE_PRIMER_USO]: 'Licencia de primer uso',
  [LicenseType.LICENCIA_TRADUCCION]: 'Licencia de traducción',
};

interface RequestUseModalProps {
  visible: boolean;
  track: TracksResponseDto;
  onClose: () => void;
}

export function RequestUseModal({ visible, track, onClose }: RequestUseModalProps) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [licenseType, setLicenseType] = useState<LicenseType | null>(null);
  const { data: requests = [], isLoading: isCheckingExisting } = useRequests();
  const createRequest = useCreateRequest();

  const existingRequest = useMemo(
    () =>
      requests.find(
        (r) =>
          (r.track?.id === track.id || r.trackId === track.id) &&
          r.status !== RequestStatus.RECHAZADA &&
          r.status !== RequestStatus.CANCELADA,
      ),
    [requests, track.id],
  );

  const handleClose = () => {
    setMessage('');
    setLicenseType(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!licenseType) return;
    try {
      await createRequest.mutateAsync({ trackId: track.id, licenseType });
      Toast.show({ type: 'success', text1: 'Solicitud enviada', text2: `"${track.title}"` });
      handleClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        Toast.show({
          type: 'error',
          text1: 'Ya tienes una solicitud activa para esta canción.',
        });
      } else {
        Toast.show({ type: 'error', text1: 'No se pudo enviar la solicitud', text2: 'Intenta de nuevo' });
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable style={[styles.sheet, { paddingBottom: 24 + insets.bottom }]}>
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Solicitar Uso</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <MaterialCommunityIcons name="close" size={22} color="rgba(255,255,255,0.4)" />
            </Pressable>
          </View>

          <Text style={styles.trackLabel} numberOfLines={1}>
            "{track.title}"
          </Text>

          {isCheckingExisting ? (
            <View style={styles.center}>
              <ActivityIndicator color={Brand.primary} />
            </View>
          ) : existingRequest ? (
            <View style={styles.blocked}>
              <MaterialCommunityIcons name="clock-alert-outline" size={32} color="rgba(255,255,255,0.3)" />
              <Text style={styles.blockedText}>Ya tienes una solicitud activa para esta canción</Text>
            </View>
          ) : (
            <>
              <Text style={styles.label}>Mensaje</Text>
              <TextInput
                style={styles.textArea}
                value={message}
                onChangeText={setMessage}
                placeholder="Cuéntale al compositor para qué quieres usar esta canción..."
                placeholderTextColor="rgba(255,255,255,0.25)"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Tipo de licencia</Text>
              <View style={styles.optionsWrap}>
                {Object.values(LicenseType).map((type) => {
                  const isSelected = type === licenseType;
                  return (
                    <Pressable
                      key={type}
                      style={[styles.option, isSelected && styles.optionSelected]}
                      onPress={() => setLicenseType(type)}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {LICENSE_LABELS[type]}
                      </Text>
                      {isSelected && (
                        <MaterialCommunityIcons name="check" size={16} color={Brand.accent} />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                style={[styles.submitBtn, (!licenseType || createRequest.isPending) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!licenseType || createRequest.isPending}
              >
                {createRequest.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Enviar solicitud</Text>
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
  trackLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  center: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  blocked: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  blockedText: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  label: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  optionsWrap: {
    gap: 4,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  optionSelected: {
    backgroundColor: 'rgba(32,138,239,0.15)',
  },
  optionText: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.7)',
  },
  optionTextSelected: {
    color: Brand.accent,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: Brand.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
