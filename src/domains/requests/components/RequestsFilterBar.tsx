import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { RequestStatus } from '../types/requests.types';

interface FilterOption {
  value: string;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Todas' },
  { value: RequestStatus.PENDIENTE, label: 'Pendiente' },
  { value: RequestStatus.APROBADA, label: 'Aprobada' },
  { value: RequestStatus.RECHAZADA, label: 'Rechazada' },
  { value: RequestStatus.CANCELADA, label: 'Cancelada' },
];

interface RequestsFilterBarProps {
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

export function RequestsFilterBar({ activeFilter, onFilterChange }: RequestsFilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {FILTER_OPTIONS.map((opt) => {
        const isActive = opt.value === activeFilter;
        return (
          <Pressable
            key={opt.value}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onFilterChange(opt.value)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingBottom: 4,
    gap: 8,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pillActive: {
    backgroundColor: 'rgba(32,138,239,0.2)',
    borderColor: `${Brand.primary}60`,
  },
  label: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  labelActive: {
    color: Brand.accent,
  },
});
