import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand, Typography } from '@/constants/theme';
import { FormToggle } from '@/shared/components/ui/FormToggle';
import type { LanguageDto } from '../types/tracks.types';

interface GenreTracksFilterModalProps {
  visible: boolean;
  onClose: () => void;
  subGenreOptions: string[];
  selectedSubGenres: string[];
  onToggleSubGenre: (value: string) => void;
  onClearSubGenres: () => void;
  language: string;
  onLanguageChange: (value: string) => void;
  languageOptions: LanguageDto[];
  isGospel: boolean;
  onIsGospelChange: (value: boolean) => void;
  onClear: () => void;
}

export function GenreTracksFilterModal({
  visible,
  onClose,
  subGenreOptions,
  selectedSubGenres,
  onToggleSubGenre,
  onClearSubGenres,
  language,
  onLanguageChange,
  languageOptions,
  isGospel,
  onIsGospelChange,
  onClear,
}: GenreTracksFilterModalProps) {
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
            <Text style={styles.groupTitle}>Gospel</Text>
            <FormToggle
              label="Solo Gospel"
              value={isGospel}
              onValueChange={onIsGospelChange}
            />

            {subGenreOptions.length > 0 && (
              <>
                <Text style={styles.groupTitle}>Subgénero</Text>
                <View style={styles.optionsWrap}>
                  <Pressable
                    style={[styles.option, selectedSubGenres.length === 0 && styles.optionSelected]}
                    onPress={onClearSubGenres}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedSubGenres.length === 0 && styles.optionTextSelected,
                      ]}
                    >
                      Todos los subgéneros
                    </Text>
                    {selectedSubGenres.length === 0 && (
                      <MaterialCommunityIcons name="check" size={16} color={Brand.accent} />
                    )}
                  </Pressable>
                  {subGenreOptions.map((sg) => {
                    const isSelected = selectedSubGenres.includes(sg);
                    return (
                      <Pressable
                        key={sg}
                        style={[styles.option, isSelected && styles.optionSelected]}
                        onPress={() => onToggleSubGenre(sg)}
                      >
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                          {sg}
                        </Text>
                        <MaterialCommunityIcons
                          name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                          size={18}
                          color={isSelected ? Brand.accent : 'rgba(255,255,255,0.3)'}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {languageOptions.length > 0 && (
              <>
                <Text style={styles.groupTitle}>Idioma</Text>
                <View style={styles.optionsWrap}>
                  <Pressable
                    style={[styles.option, language === 'all' && styles.optionSelected]}
                    onPress={() => onLanguageChange('all')}
                  >
                    <Text style={[styles.optionText, language === 'all' && styles.optionTextSelected]}>
                      Todos los idiomas
                    </Text>
                    {language === 'all' && (
                      <MaterialCommunityIcons name="check" size={16} color={Brand.accent} />
                    )}
                  </Pressable>
                  {languageOptions.map((lang) => {
                    const isSelected = lang.code === language;
                    return (
                      <Pressable
                        key={lang.code}
                        style={[styles.option, isSelected && styles.optionSelected]}
                        onPress={() => onLanguageChange(lang.code)}
                      >
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                          {lang.label}
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
