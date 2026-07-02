import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Brand, Typography } from '@/constants/theme';

interface SubGenreSelectorMobileProps {
  subGenres: string[];
  value: string;
  onChange: (subGenre: string) => void;
  error?: string;
}

export function SubGenreSelectorMobile({ subGenres, value, onChange, error }: SubGenreSelectorMobileProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  if (subGenres.length === 0) return null;

  return (
    <>
      <Pressable
        style={[styles.trigger, !!error && styles.triggerError]}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value || 'Seleccionar subgénero'}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="rgba(255,255,255,0.4)" />
      </Pressable>
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Seleccionar subgénero</Text>
            <FlatList
              data={subGenres}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item === value;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => { onChange(item); setOpen(false); }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {item}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={18} color={Brand.accent} />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    height: 54,
  },
  triggerError: { borderColor: 'rgba(255,80,80,0.6)' },
  triggerText: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  placeholder: { color: 'rgba(255,255,255,0.25)' },
  errorText: { ...Typography.caption, color: 'rgba(255,85,85,0.9)', marginTop: 6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingTop: 20,
    minHeight: '45%',
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: { ...Typography.title, color: '#FFFFFF', fontWeight: '700', marginBottom: 16 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionSelected: { backgroundColor: 'rgba(32,138,239,0.15)' },
  optionText: { ...Typography.label, color: 'rgba(255,255,255,0.7)', flex: 1 },
  optionTextSelected: { color: Brand.accent, fontWeight: '600' },
});
