import { StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';
import { RequestStatus } from '../types/requests.types';

interface RequestStatusBadgeProps {
  status: RequestStatus;
}

const STATUS_CONFIG: Record<RequestStatus, { label: string; bg: string; text: string }> = {
  [RequestStatus.PENDIENTE]: { label: 'Pendiente', bg: 'rgba(251,191,36,0.15)', text: '#FBB024' },
  [RequestStatus.APROBADA]: { label: 'Aprobada', bg: 'rgba(74,222,128,0.15)', text: '#4ade80' },
  [RequestStatus.RECHAZADA]: { label: 'Rechazada', bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
  [RequestStatus.CANCELADA]: { label: 'Cancelada', bg: 'rgba(148,163,184,0.15)', text: '#94a3b8' },
};

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[RequestStatus.PENDIENTE];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
