import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { RequestStatus } from '../types/requests.types';
import { RequestStatusBadge } from './RequestStatusBadge';
import type { TrackRequest } from '../types/requests.types';
import { formatFullName } from '@/shared/utils/formatName';

interface RequestCardProps {
  request: TrackRequest;
  activeTab: 'enviadas' | 'recibidas';
  userId?: string;
  onApprove?: (request: TrackRequest) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  isProcessing?: boolean;
}

const COVER_SIZE = 52;
const PLACEHOLDER = require('@/assets/images/icon.png');

export function RequestCard({
  request,
  activeTab,
  userId,
  onApprove,
  onReject,
  onCancel,
  isProcessing,
}: RequestCardProps) {
  const isPending = request.status === RequestStatus.PENDIENTE;
  const isSent = activeTab === 'enviadas';

  const formattedDate = new Date(request.createdAt).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Image
          source={request.track?.coverUrl ? { uri: request.track.coverUrl } : PLACEHOLDER}
          style={styles.cover}
          contentFit="cover"
        />
        <View style={styles.info}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {request.track?.title ?? 'Sin título'}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {isSent
              ? `Para: ${request.track?.title ?? '—'}`
              : `De: ${formatFullName(request.requester?.name, request.requester?.lastName) || '—'}`}
          </Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <RequestStatusBadge status={request.status} />
      </View>

      {!!request.licenseType && (
        <Text style={styles.license}>Licencia: {request.licenseType}</Text>
      )}

      {isPending && !isSent && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, styles.btnApprove]}
            onPress={() => onApprove?.(request)}
            disabled={isProcessing}
          >
            <Text style={styles.btnText}>Aprobar</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnReject]}
            onPress={() => onReject?.(request.id)}
            disabled={isProcessing}
          >
            <Text style={styles.btnText}>Rechazar</Text>
          </Pressable>
        </View>
      )}

      {isPending && isSent && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, styles.btnCancel]}
            onPress={() => onCancel?.(request.id)}
            disabled={isProcessing}
          >
            <Text style={styles.btnText}>Cancelar solicitud</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  trackTitle: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  meta: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.5)',
  },
  date: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.3)',
  },
  license: {
    ...Typography.caption,
    color: Brand.accent,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnApprove: {
    backgroundColor: 'rgba(74,222,128,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
  },
  btnReject: {
    backgroundColor: 'rgba(248,113,113,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
  },
  btnCancel: {
    backgroundColor: 'rgba(148,163,184,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
  },
  btnText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
