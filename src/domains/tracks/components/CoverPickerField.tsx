import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Brand, Typography } from '@/constants/theme';

interface CoverPickerFieldProps {
  uri: string;
  onPick: (uri: string) => void;
  onClear: () => void;
  error?: string;
}

export function CoverPickerField({ uri, onPick, onClear, error }: CoverPickerFieldProps) {
  const handlePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      onPick(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {uri ? (
          <View style={styles.previewWrapper}>
            <Image source={{ uri }} style={styles.preview} contentFit="cover" />
            <Pressable
              style={({ pressed }) => [styles.clearOverlay, pressed && { opacity: 0.7 }]}
              onPress={onClear}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.emptyBox,
              !!error && styles.emptyBoxError,
              pressed && { opacity: 0.7 },
            ]}
            onPress={handlePick}
          >
            <MaterialCommunityIcons name="image-plus" size={24} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyLabel}>Portada</Text>
          </Pressable>
        )}
        <View style={styles.info}>
          <Text style={styles.fieldLabel}>
            {uri ? 'Portada seleccionada' : 'Agregar portada'}
          </Text>
          <Text style={styles.fieldHint}>
            {uri ? 'Toca la X para cambiarla' : 'Cuadrada · JPG, PNG · Opcional'}
          </Text>
          {!uri && (
            <Pressable
              style={({ pressed }) => [styles.selectBtn, pressed && { opacity: 0.7 }]}
              onPress={handlePick}
            >
              <Text style={styles.selectBtnText}>Seleccionar imagen</Text>
            </Pressable>
          )}
        </View>
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  previewWrapper: { position: 'relative', flexShrink: 0 },
  preview: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  clearOverlay: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#080B12',
    borderRadius: 10,
  },
  emptyBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexShrink: 0,
  },
  emptyBoxError: { borderColor: 'rgba(255,80,80,0.5)' },
  emptyLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.3)' },
  info: { flex: 1, gap: 4 },
  fieldLabel: { ...Typography.label, color: '#FFFFFF', fontWeight: '600' },
  fieldHint: { ...Typography.caption, color: 'rgba(255,255,255,0.35)' },
  selectBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  selectBtnText: { ...Typography.caption, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  errorText: { ...Typography.caption, color: 'rgba(255,85,85,0.9)', marginTop: 6 },
});
