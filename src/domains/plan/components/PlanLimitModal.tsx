import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { usePlanLimitStore } from '@/shared/stores/planLimit.store';
import { RESOURCE_LABELS } from '../constants/resource-labels';
import { getPricingUrl } from '../utils/web-checkout.utils';

export function PlanLimitModal() {
  const activeLimit = usePlanLimitStore((s) => s.activeLimit);
  const dismiss = usePlanLimitStore((s) => s.dismiss);

  if (!activeLimit) return null;

  const label = RESOURCE_LABELS[activeLimit.resource] ?? activeLimit.resource;

  const handleUpgrade = () => {
    dismiss();
    Linking.openURL(getPricingUrl());
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={dismiss}>
      <Pressable style={styles.backdrop} onPress={dismiss}>
        <Pressable style={styles.card}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="star-four-points-outline" size={28} color={Brand.accent} />
          </View>
          <Text style={styles.title}>Límite de plan alcanzado</Text>
          <Text style={styles.description}>
            Tu plan actual permite hasta {activeLimit.limit} {label}. Actualiza a Pro para continuar sin
            restricciones.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.85 }]}
            onPress={handleUpgrade}
          >
            <Text style={styles.primaryButtonText}>Ver planes Pro</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.7 }]} onPress={dismiss}>
            <Text style={styles.secondaryButtonText}>Cerrar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(60,159,254,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 8,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: Brand.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
});
