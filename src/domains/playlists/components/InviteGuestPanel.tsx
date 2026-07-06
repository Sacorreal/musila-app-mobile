import { useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { Brand, Typography } from '@/constants/theme';
import { useCreateInvite } from '@/domains/guests/hooks/use-guests.hooks';
import type { InviteResponse } from '@/domains/guests/types/guests.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteGuestPanelProps {
  onBack: () => void;
}

export function InviteGuestPanel({ onBack }: InviteGuestPanelProps) {
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [invite, setInvite] = useState<InviteResponse | null>(null);
  const [showQr, setShowQr] = useState(false);
  const createInvite = useCreateInvite();

  const handleSubmit = () => {
    if (!guestName.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Ingresa un email válido');
      return;
    }
    setError('');
    createInvite.mutate(
      { guestName: guestName.trim(), email: email.trim() },
      {
        onSuccess: (result) => {
          setInvite(result);
          Toast.show({ type: 'success', text1: 'Invitación creada' });
        },
        onError: (err: any) => {
          Toast.show({
            type: 'error',
            text1: 'No se pudo crear la invitación',
            text2: err?.response?.data?.message ?? 'Intenta de nuevo',
          });
        },
      },
    );
  };

  const handleCopy = async () => {
    if (!invite) return;
    await Clipboard.setStringAsync(invite.inviteUrl);
    Toast.show({ type: 'success', text1: 'Enlace copiado' });
  };

  const handleShare = async () => {
    if (!invite) return;
    try {
      await Share.share({ message: invite.inviteUrl });
    } catch {
      // el usuario canceló el share sheet, sin acción
    }
  };

  const handleCreateAnother = () => {
    setInvite(null);
    setGuestName('');
    setEmail('');
    setShowQr(false);
  };

  if (invite) {
    const expiresLabel = new Date(invite.expiresAt).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.form}>
        <View style={styles.successCard}>
          <MaterialCommunityIcons name="check-circle-outline" size={28} color="#4ade80" />
          <Text style={styles.successText}>
            ¡Invitación creada! Se envió un email a {invite.email}
          </Text>
        </View>

        <Text style={styles.fieldLabel}>Enlace de invitación</Text>
        <View style={styles.linkRow}>
          <Text style={styles.linkText} numberOfLines={1}>
            {invite.inviteUrl}
          </Text>
          <Pressable onPress={handleCopy} hitSlop={10}>
            <MaterialCommunityIcons name="content-copy" size={18} color={Brand.accent} />
          </Pressable>
        </View>

        <View style={styles.btnRow}>
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={handleShare}>
            <MaterialCommunityIcons name="share-variant-outline" size={18} color="rgba(255,255,255,0.8)" />
            <Text style={styles.btnSecondaryText}>Compartir</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => setShowQr((v) => !v)}>
            <MaterialCommunityIcons name="qrcode" size={18} color="rgba(255,255,255,0.8)" />
            <Text style={styles.btnSecondaryText}>{showQr ? 'Ocultar QR' : 'Ver QR'}</Text>
          </Pressable>
        </View>

        {showQr && (
          <View style={styles.qrWrapper}>
            <Image source={{ uri: invite.qrCode }} style={styles.qr} contentFit="contain" />
          </View>
        )}

        <Text style={styles.expiresText}>Expira el {expiresLabel}</Text>

        <Pressable style={[styles.btn, styles.btnCreate]} onPress={handleCreateAnother}>
          <Text style={styles.btnCreateText}>Crear otra invitación</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <Text style={styles.fieldLabel}>Nombre del invitado</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Ej. Juan Pérez"
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={guestName}
          onChangeText={(t) => { setGuestName(t); setError(''); }}
          autoFocus
        />
      </View>

      <Text style={styles.fieldLabel}>Email</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={email}
          onChangeText={(t) => { setEmail(t); setError(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.btnRow}>
        <Pressable style={[styles.btn, styles.btnCancel]} onPress={onBack}>
          <Text style={styles.btnCancelText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnCreate]}
          onPress={handleSubmit}
          disabled={createInvite.isPending}
        >
          {createInvite.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.btnCreateText}>Enviar invitación</Text>
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
    borderColor: 'rgba(255,255,255,0.1)',
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
    flexDirection: 'row',
    gap: 6,
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
  btnCreate: {
    backgroundColor: Brand.primaryDark,
  },
  btnCreateText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btnSecondaryText: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(74,222,128,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
    borderRadius: 14,
    padding: 14,
  },
  successText: {
    ...Typography.body,
    color: '#FFFFFF',
    flex: 1,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 14,
    height: 46,
  },
  linkText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  qrWrapper: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  qr: {
    width: 180,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  expiresText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
