import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import type { AvailabilityFilter } from '../types/tracks.types';

const AVAILABILITY_OPTIONS: { value: AvailabilityFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'available', label: 'Disponibles' },
  { value: 'unavailable', label: 'No disponibles' },
];

interface MyTracksFilterModalProps {
  visible: boolean;
  onClose: () => void;
  availability: AvailabilityFilter;
  onAvailabilityChange: (value: AvailabilityFilter) => void;
  genres: string[];
  genre: string;
  onGenreChange: (value: string) => void;
  onClear: () => void;
}

export function MyTracksFilterModal({
  visible,
  onClose,
  availability,
  onAvailabilityChange,
  genres,
  genre,
  onGenreChange,
  onClear,
}: MyTracksFilterModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.header}>
            <Text style={styles.sheetTitle}>Filtrar canciones</Text>
            <Pressable onPress={onClear} hitSlop={10}>
              <Text style={styles.clearText}>Limpiar</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.groupTitle}>Estado</Text>
            <View style={styles.optionsWrap}>
              {AVAILABILITY_OPTIONS.map((opt) => {
                const isSelected = opt.value === availability;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => onAvailabilityChange(opt.value)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={16} color={Brand.accent} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {genres.length > 0 && (
              <>
                <Text style={styles.groupTitle}>Género</Text>
                <View style={styles.optionsWrap}>
                  <Pressable
                    style={[styles.option, genre === 'all' && styles.optionSelected]}
                    onPress={() => onGenreChange('all')}
                  >
                    <Text style={[styles.optionText, genre === 'all' && styles.optionTextSelected]}>
                      Todos
                    </Text>
                    {genre === 'all' && (
                      <MaterialCommunityIcons name="check" size={16} color={Brand.accent} />
                    )}
                  </Pressable>
                  {genres.map((g) => {
                    const isSelected = g === genre;
                    return (
                      <Pressable
                        key={g}
                        style={[styles.option, isSelected && styles.optionSelected]}
                        onPress={() => onGenreChange(g)}
                      >
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                          {g}
                        </Text>
                        {isSelected && (
                          <MaterialCommunityIcons name="check" size={16} color={Brand.accent} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>

          <Pressable style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Aplicar filtros</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '75%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  clearText: {
    ...Typography.caption,
    color: Brand.accent,
    fontWeight: '600',
  },
  groupTitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },
  optionsWrap: {
    gap: 4,
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
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
  applyButton: {
    backgroundColor: Brand.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  applyButtonText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
