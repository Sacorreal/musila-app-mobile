import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import { ROLE_LABELS } from '@/domains/users/constants/role-labels';
import { UserRole } from '@/domains/users/types/users.types';
import { useMiniPlayerSpacing } from '@/domains/player/hooks/use-mini-player-spacing';
import { HomeButton } from '@/shared/components/ui/HomeButton';
import { usePlanStatus } from '../hooks/use-plan.hooks';
import { getPricingUrl } from '../utils/web-checkout.utils';
import { UsageBar } from './UsageBar';
import type { PlanResource } from '../types/plan.types';

export function PlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const miniPlayerSpacing = useMiniPlayerSpacing();
  const { data: plan, isLoading, isError, refetch } = usePlanStatus();

  const handleUpgrade = () => Linking.openURL(getPricingUrl());

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Mi Plan</Text>
        <HomeButton />
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator color={Brand.primary} size="large" />
        </View>
      )}

      {!isLoading && isError && (
        <View style={styles.center}>
          <MaterialCommunityIcons name="wifi-off" size={40} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyText}>No pudimos cargar tu plan</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !isError && plan && (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 40 + miniPlayerSpacing }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.planCard}>
            <View style={styles.planCardHeader}>
              <View>
                <Text style={styles.planRole}>{ROLE_LABELS[plan.role as UserRole] ?? plan.role}</Text>
                <Text style={styles.planName}>{plan.plan === 'pro' ? 'Plan Pro' : 'Plan Free'}</Text>
              </View>
              <View style={[styles.planBadge, plan.plan === 'pro' && styles.planBadgePro]}>
                <Text style={[styles.planBadgeText, plan.plan === 'pro' && styles.planBadgeTextPro]}>
                  {plan.plan === 'pro' ? 'PRO' : 'FREE'}
                </Text>
              </View>
            </View>

            <Text style={styles.planVigencia}>
              {plan.isLifetime
                ? 'Acceso de por vida'
                : plan.isExpired
                  ? 'Tu plan Pro expiró'
                  : plan.expiresAt && plan.daysRemaining !== null
                    ? `Vence en ${plan.daysRemaining} día${plan.daysRemaining === 1 ? '' : 's'}`
                    : 'Sin fecha de vencimiento'}
            </Text>

            {plan.plan === 'free' && (
              <Pressable
                style={({ pressed }) => [styles.upgradeBtn, pressed && { opacity: 0.85 }]}
                onPress={handleUpgrade}
              >
                <MaterialCommunityIcons name="star-four-points-outline" size={16} color="#FFFFFF" />
                <Text style={styles.upgradeBtnText}>Mejorar a Pro</Text>
              </Pressable>
            )}
          </View>

          {plan.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Beneficios de tu plan</Text>
              {plan.features.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={Brand.accent} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {Object.keys(plan.usage).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Uso actual</Text>
              <View style={styles.usageList}>
                {(Object.entries(plan.usage) as [PlanResource, { current: number; limit: number | null }][]).map(
                  ([resource, usage]) => (
                    <UsageBar key={resource} resource={resource} current={usage.current} limit={usage.limit} />
                  ),
                )}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.4)',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Brand.primary,
  },
  retryBtnText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
  },
  planCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    gap: 14,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  planRole: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  planName: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  planBadgePro: {
    backgroundColor: 'rgba(60,159,254,0.15)',
    borderColor: `${Brand.primary}60`,
  },
  planBadgeText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '800',
  },
  planBadgeTextPro: {
    color: Brand.accent,
  },
  planVigencia: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.5)',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 14,
    backgroundColor: Brand.primaryDark,
  },
  upgradeBtnText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.75)',
  },
  usageList: {
    gap: 16,
  },
});
