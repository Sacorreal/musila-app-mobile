import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Brand, Typography } from '@/constants/theme';

interface AudioPickerFieldProps {
  uri: string;
  fileName: string;
  mimeType: string;
  onPick: (uri: string, name: string, mimeType: string, size?: number) => void;
  onClear: () => void;
  error?: string;
}

export function AudioPickerField({ uri, fileName, onPick, onClear, error }: AudioPickerFieldProps) {
  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      onPick(asset.uri, asset.name, asset.mimeType ?? 'audio/mpeg', asset.size);
    }
  };

  if (!uri) {
    return (
      <View style={styles.wrapper}>
        <Pressable
          style={({ pressed }) => [styles.emptyBox, !!error && styles.emptyBoxError, pressed && { opacity: 0.7 }]}
          onPress={handlePick}
        >
          <MaterialCommunityIcons name="music-note-plus" size={28} color={Brand.accent} />
          <Text style={styles.emptyLabel}>Seleccionar audio</Text>
          <Text style={styles.emptyHint}>MP3, WAV, AAC…</Text>
        </Pressable>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.selectedBox, !!error && styles.emptyBoxError]}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="file-music" size={22} color={Brand.accent} />
        </View>
        <Text style={styles.fileName} numberOfLines={1}>
          {fileName}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.6 }]}
          onPress={onClear}
          hitSlop={8}
        >
          <MaterialCommunityIcons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
        </Pressable>
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  emptyBox: {
    height: 90,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(60,159,254,0.4)',
    backgroundColor: 'rgba(32,138,239,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyBoxError: { borderColor: 'rgba(255,80,80,0.6)' },
  emptyLabel: { ...Typography.label, color: Brand.accent, fontWeight: '600' },
  emptyHint: { ...Typography.caption, color: 'rgba(255,255,255,0.3)' },
  selectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(60,159,254,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(32,138,239,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fileName: { ...Typography.label, color: '#FFFFFF', flex: 1, fontWeight: '500' },
  clearBtn: { flexShrink: 0 },
  errorText: { ...Typography.caption, color: 'rgba(255,85,85,0.9)', marginTop: 6 },
});
