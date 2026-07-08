import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Brand, Typography } from '@/constants/theme';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { UserRole } from '@/domains/users/types/users.types';
import { useRequests, useUpdateRequestStatus } from '@/domains/requests/hooks/use-requests.hooks';
import { RequestStatus, type TrackRequest } from '@/domains/requests/types/requests.types';
import { RequestCard } from '@/domains/requests/components/RequestCard';
import { ApproveRequestModal } from '@/domains/requests/components/ApproveRequestModal';
import { RequestsTabBar, TabKey } from '@/domains/requests/components/RequestsTabBar';
import { RequestsFilterBar } from '@/domains/requests/components/RequestsFilterBar';
import {
  getAvailableTabs,
  getReceivedRequests,
  getSentRequests,
} from '@/domains/requests/libs/requests.utils';
import { useMiniPlayerSpacing } from '@/domains/player/hooks/use-mini-player-spacing';

export function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const miniPlayerSpacing = useMiniPlayerSpacing();
  const user = useAuthStore((s) => s.user);
  const role = user?.role as UserRole | undefined;

  const availableTabs = getAvailableTabs(role);
  const [activeTab, setActiveTab] = useState<TabKey>(availableTabs[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvingRequest, setApprovingRequest] = useState<TrackRequest | null>(null);

  const { data: requests = [], isLoading } = useRequests();
  const updateMutation = useUpdateRequestStatus();

  const sent = useMemo(() => getSentRequests(requests, user?.id), [requests, user?.id]);

  const received = useMemo(
    () => getReceivedRequests(requests, user?.id, role),
    [requests, user?.id, role]
  );

  const sourceList = activeTab === 'enviadas' ? sent : received;

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return sourceList;
    return sourceList.filter((r) => r.status === statusFilter);
  }, [sourceList, statusFilter]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setStatusFilter('all');
  };

  const handleApprove = (request: TrackRequest) => {
    setApprovingRequest(request);
  };

  const handleReject = (id: string) => {
    Alert.alert('Rechazar solicitud', '¿Deseas rechazar esta solicitud?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: () => {
          updateMutation.mutate(
            { id, status: RequestStatus.RECHAZADA },
            {
              onSuccess: () => Toast.show({ type: 'success', text1: 'Solicitud rechazada' }),
              onError: () => Toast.show({ type: 'error', text1: 'No se pudo actualizar' }),
            }
          );
        },
      },
    ]);
  };

  const handleCancel = (id: string) => {
    Alert.alert('Cancelar solicitud', '¿Deseas cancelar esta solicitud?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancelar solicitud',
        style: 'destructive',
        onPress: () => {
          updateMutation.mutate(
            { id, status: RequestStatus.CANCELADA },
            {
              onSuccess: () => Toast.show({ type: 'success', text1: 'Solicitud cancelada' }),
              onError: () => Toast.show({ type: 'error', text1: 'No se pudo actualizar' }),
            }
          );
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bgOrb} pointerEvents="none" />

      <ReAnimated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
        <Text style={styles.title}>Solicitudes</Text>
        <Text style={styles.subtitle}>Gestiona las solicitudes de uso de canciones</Text>
      </ReAnimated.View>

      <RequestsTabBar
        activeTab={activeTab}
        availableTabs={availableTabs}
        sentCount={sent.length}
        receivedCount={received.length}
        onTabChange={handleTabChange}
      />

      <View style={styles.filterWrapper}>
        <RequestsFilterBar activeFilter={statusFilter} onFilterChange={setStatusFilter} />
      </View>

      {!isLoading && (
        <Text style={styles.resultsCount}>
          {filteredRequests.length} {filteredRequests.length === 1 ? 'solicitud' : 'solicitudes'}
        </Text>
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Brand.primary} size="large" />
          <Text style={styles.loadingText}>Cargando solicitudes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RequestCard
              request={item}
              activeTab={activeTab}
              userId={user?.id}
              onApprove={handleApprove}
              onReject={handleReject}
              onCancel={handleCancel}
              isProcessing={updateMutation.isPending}
            />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: 40 + miniPlayerSpacing }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Sin solicitudes</Text>
              <Text style={styles.emptySubtitle}>
                No hay solicitudes {activeTab === 'enviadas' ? 'enviadas' : 'recibidas'} con este filtro
              </Text>
            </View>
          }
        />
      )}

      <ApproveRequestModal
        visible={!!approvingRequest}
        request={approvingRequest}
        onClose={() => setApprovingRequest(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
    paddingHorizontal: 20,
  },
  bgOrb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(32,138,239,0.06)',
    top: -60,
    right: -80,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
    gap: 4,
  },
  title: {
    ...Typography.display,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.4)',
  },
  filterWrapper: {
    marginBottom: 12,
  },
  resultsCount: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.4)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptySubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  listContent: {
    paddingBottom: 40,
  },
});
