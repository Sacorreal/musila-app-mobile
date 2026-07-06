import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Brand, Typography } from '@/constants/theme';
import { useRequests } from '@/domains/requests/hooks/use-requests.hooks';
import { RequestStatusBadge } from '@/domains/requests/components/RequestStatusBadge';
import { formatFullName } from '@/shared/utils/formatName';

interface TrackRequestsSectionProps {
  trackId: string;
}

export function TrackRequestsSection({ trackId }: TrackRequestsSectionProps) {
  const { data: allRequests = [], isLoading } = useRequests();

  const trackRequests = allRequests.filter(
    (r) => r.track?.id === trackId || r.trackId === trackId,
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Solicitudes recibidas</Text>
        {trackRequests.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{trackRequests.length}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Brand.primary} size="small" />
        </View>
      ) : trackRequests.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="inbox-outline" size={32} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyText}>Aún no hay solicitudes para este track</Text>
        </View>
      ) : (
        trackRequests.map((request) => {
          const formattedDate = new Date(request.createdAt).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          return (
            <View key={request.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.cardInfo}>
                  <Text style={styles.requesterName} numberOfLines={1}>
                    {request.requester
                      ? formatFullName(request.requester.name, request.requester.lastName)
                      : 'Solicitante desconocido'}
                  </Text>
                  {!!request.licenseType && (
                    <Text style={styles.licenseType} numberOfLines={1}>
                      {request.licenseType}
                    </Text>
                  )}
                  <Text style={styles.date}>{formattedDate}</Text>
                </View>
                <RequestStatusBadge status={request.status} />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: Brand.primary,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  center: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  requesterName: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  licenseType: {
    ...Typography.caption,
    color: Brand.accent,
    textTransform: 'capitalize',
  },
  date: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.3)',
  },
});
