import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Brand, Typography } from '@/constants/theme';
import {
  copyrightOfficeOptions,
  cmoOptions,
  type CopyrightOfficeOption,
  type CmoOption,
} from '../data/intellectual-property.data';

export interface IPEntry {
  type: 'copyrightOffice' | 'cmo' | 'splitSheet';
  key: string;
  documentUri: string;
  documentName: string;
}

interface IntellectualPropertyFormSectionProps {
  entries: IPEntry[];
  onChange: (entries: IPEntry[]) => void;
}

type ActiveModal = { type: 'copyright' | 'cmo'; index: number } | null;

const TYPE_CONFIG = {
  copyrightOffice: { label: 'Copyright Office', color: '#208AEF', bg: 'rgba(32,138,239,0.15)', icon: 'earth' as const },
  cmo: { label: 'CMO', color: '#7C3AED', bg: 'rgba(124,58,237,0.15)', icon: 'domain' as const },
  splitSheet: { label: 'Split Sheet', color: '#059669', bg: 'rgba(5,150,105,0.15)', icon: 'account-group' as const },
};

export function IntellectualPropertyFormSection({ entries, onChange }: IntellectualPropertyFormSectionProps) {
  const [enabled, setEnabled] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const hasSplitSheet = entries.some((e) => e.type === 'splitSheet');

  const addEntry = (type: IPEntry['type']) => {
    onChange([
      ...entries,
      { type, key: type === 'splitSheet' ? 'Split Sheet' : '', documentUri: '', documentName: '' },
    ]);
  };

  const updateEntry = (index: number, patch: Partial<IPEntry>) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const pickDocument = async (index: number) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      updateEntry(index, { documentUri: asset.uri, documentName: asset.name });
    }
  };

  const handleToggle = (value: boolean) => {
    setEnabled(value);
    if (!value) onChange([]);
  };

  return (
    <View style={styles.section}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="shield-check-outline" size={20} color={Brand.accent} />
          <Text style={styles.headerTitle}>Propiedad Intelectual</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{ false: 'rgba(255,255,255,0.1)', true: Brand.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      {enabled && (
        <>
          {/* Add buttons */}
          <View style={styles.addRow}>
            <Pressable
              style={({ pressed }) => [styles.addBtn, styles.addBtnCopyright, pressed && { opacity: 0.7 }]}
              onPress={() => addEntry('copyrightOffice')}
            >
              <MaterialCommunityIcons name="earth" size={15} color="#208AEF" />
              <Text style={[styles.addBtnText, { color: '#208AEF' }]}>Copyright</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.addBtn, styles.addBtnCmo, pressed && { opacity: 0.7 }]}
              onPress={() => addEntry('cmo')}
            >
              <MaterialCommunityIcons name="domain" size={15} color="#7C3AED" />
              <Text style={[styles.addBtnText, { color: '#7C3AED' }]}>CMO</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.addBtn,
                styles.addBtnSplit,
                hasSplitSheet && styles.addBtnDisabled,
                pressed && !hasSplitSheet && { opacity: 0.7 },
              ]}
              onPress={() => !hasSplitSheet && addEntry('splitSheet')}
              disabled={hasSplitSheet}
            >
              <MaterialCommunityIcons
                name="account-group"
                size={15}
                color={hasSplitSheet ? 'rgba(255,255,255,0.2)' : '#059669'}
              />
              <Text style={[styles.addBtnText, { color: hasSplitSheet ? 'rgba(255,255,255,0.2)' : '#059669' }]}>
                Split Sheet
              </Text>
            </Pressable>
          </View>

          {/* Entries */}
          {entries.map((entry, index) => {
            const config = TYPE_CONFIG[entry.type];
            return (
              <View key={index} style={styles.entryCard}>
                {/* Card header */}
                <View style={styles.entryHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
                    <MaterialCommunityIcons name={config.icon} size={13} color={config.color} />
                    <Text style={[styles.typeBadgeText, { color: config.color }]}>{config.label}</Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.5 }]}
                    onPress={() => removeEntry(index)}
                    hitSlop={8}
                  >
                    <MaterialCommunityIcons name="close" size={16} color="rgba(255,255,255,0.4)" />
                  </Pressable>
                </View>

                {/* Key selector */}
                {entry.type === 'copyrightOffice' && (
                  <Pressable
                    style={({ pressed }) => [styles.selectorBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => setActiveModal({ type: 'copyright', index })}
                  >
                    <Text style={[styles.selectorText, !entry.key && styles.selectorPlaceholder]} numberOfLines={1}>
                      {entry.key
                        ? copyrightOfficeOptions.find((o) => o.countryCode === entry.key)
                          ? `${copyrightOfficeOptions.find((o) => o.countryCode === entry.key)!.countryName} — ${copyrightOfficeOptions.find((o) => o.countryCode === entry.key)!.officeName}`
                          : entry.key
                        : 'Seleccionar país / oficina'}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={18} color="rgba(255,255,255,0.4)" />
                  </Pressable>
                )}

                {entry.type === 'cmo' && (
                  <Pressable
                    style={({ pressed }) => [styles.selectorBtn, pressed && { opacity: 0.7 }]}
                    onPress={() => setActiveModal({ type: 'cmo', index })}
                  >
                    <Text style={[styles.selectorText, !entry.key && styles.selectorPlaceholder]} numberOfLines={1}>
                      {entry.key
                        ? cmoOptions.find((c) => c.acronym === entry.key)
                          ? `${entry.key} — ${cmoOptions.find((c) => c.acronym === entry.key)!.originalName}`
                          : entry.key
                        : 'Seleccionar CMO'}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={18} color="rgba(255,255,255,0.4)" />
                  </Pressable>
                )}

                {entry.type === 'splitSheet' && (
                  <View style={styles.splitSheetLabel}>
                    <MaterialCommunityIcons name="file-document-multiple-outline" size={15} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.splitSheetText}>Acuerdo de distribución de derechos</Text>
                  </View>
                )}

                {/* Document picker */}
                <Pressable
                  style={({ pressed }) => [
                    styles.docPickerBtn,
                    !!entry.documentUri && styles.docPickerBtnSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => pickDocument(index)}
                >
                  <MaterialCommunityIcons
                    name={entry.documentUri ? 'file-check' : 'paperclip'}
                    size={16}
                    color={entry.documentUri ? '#4ade80' : 'rgba(255,255,255,0.5)'}
                  />
                  <Text
                    style={[styles.docPickerText, entry.documentUri && styles.docPickerTextSelected]}
                    numberOfLines={1}
                  >
                    {entry.documentName || 'Adjuntar PDF'}
                  </Text>
                  {entry.documentUri && (
                    <MaterialCommunityIcons name="check-circle" size={15} color="#4ade80" />
                  )}
                </Pressable>
              </View>
            );
          })}
        </>
      )}

      {/* Copyright Office modal */}
      <Modal
        visible={activeModal?.type === 'copyright'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setActiveModal(null)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Seleccionar país / Copyright Office</Text>
            <FlatList
              data={copyrightOfficeOptions}
              keyExtractor={(o) => o.countryCode}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }: { item: CopyrightOfficeOption }) => {
                const isSelected = activeModal !== null && entries[activeModal.index]?.key === item.countryCode;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.sheetOption,
                      isSelected && styles.sheetOptionSelected,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => {
                      if (activeModal) updateEntry(activeModal.index, { key: item.countryCode });
                      setActiveModal(null);
                    }}
                  >
                    <View style={styles.sheetOptionContent}>
                      <Text style={[styles.sheetOptionMain, isSelected && { color: Brand.accent }]}>
                        {item.countryName}
                      </Text>
                      <Text style={styles.sheetOptionSub} numberOfLines={1}>
                        {item.officeName}
                      </Text>
                    </View>
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

      {/* CMO modal */}
      <Modal
        visible={activeModal?.type === 'cmo'}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setActiveModal(null)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Seleccionar CMO</Text>
            <FlatList
              data={cmoOptions}
              keyExtractor={(c) => c.acronym}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }: { item: CmoOption }) => {
                const isSelected = activeModal !== null && entries[activeModal.index]?.key === item.acronym;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.sheetOption,
                      isSelected && styles.sheetOptionSelected,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => {
                      if (activeModal) updateEntry(activeModal.index, { key: item.acronym });
                      setActiveModal(null);
                    }}
                  >
                    <View style={styles.sheetOptionContent}>
                      <Text style={[styles.sheetOptionMain, isSelected && { color: Brand.accent }]}>
                        {item.acronym}
                      </Text>
                      <Text style={styles.sheetOptionSub} numberOfLines={2}>
                        {item.originalName}
                      </Text>
                    </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { ...Typography.label, color: '#FFFFFF', fontWeight: '700' },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  addBtnCopyright: { backgroundColor: 'rgba(32,138,239,0.1)', borderColor: 'rgba(32,138,239,0.3)' },
  addBtnCmo: { backgroundColor: 'rgba(124,58,237,0.1)', borderColor: 'rgba(124,58,237,0.3)' },
  addBtnSplit: { backgroundColor: 'rgba(5,150,105,0.1)', borderColor: 'rgba(5,150,105,0.3)' },
  addBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' },
  addBtnText: { ...Typography.caption, fontWeight: '600' },
  entryCard: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    gap: 10,
  },
  entryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeBadgeText: { ...Typography.caption, fontWeight: '700' },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  selectorText: { ...Typography.caption, color: '#FFFFFF', flex: 1 },
  selectorPlaceholder: { color: 'rgba(255,255,255,0.3)' },
  splitSheetLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  splitSheetText: { ...Typography.caption, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' },
  docPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  docPickerBtnSelected: {
    borderStyle: 'solid',
    borderColor: 'rgba(74,222,128,0.3)',
    backgroundColor: 'rgba(74,222,128,0.05)',
  },
  docPickerText: { ...Typography.caption, color: 'rgba(255,255,255,0.5)', flex: 1 },
  docPickerTextSelected: { color: '#4ade80' },

  /* Modals */
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
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
  sheetTitle: { ...Typography.title, color: '#FFFFFF', fontWeight: '700', marginBottom: 16 },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
    gap: 10,
  },
  sheetOptionSelected: { backgroundColor: 'rgba(32,138,239,0.12)' },
  sheetOptionContent: { flex: 1 },
  sheetOptionMain: { ...Typography.label, color: '#FFFFFF', fontWeight: '600', marginBottom: 2 },
  sheetOptionSub: { ...Typography.caption, color: 'rgba(255,255,255,0.4)' },
});
