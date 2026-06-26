import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text } from 'react-native';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { Brand, Typography } from '@/constants/theme';

interface PublishSuccessScreenProps {
  onReset: () => void;
}

export function PublishSuccessScreen({ onReset }: PublishSuccessScreenProps) {
  return (
    <ReAnimated.View entering={FadeInDown.springify()} style={styles.container}>
      <MaterialCommunityIcons name="check-circle" size={64} color="#4ade80" />
      <Text style={styles.title}>¡Canción publicada!</Text>
      <Text style={styles.subtitle}>Tu canción está en revisión y estará disponible pronto</Text>
      <Pressable style={styles.btn} onPress={onReset}>
        <Text style={styles.btnText}>Publicar otra canción</Text>
      </Pressable>
    </ReAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  title: {
    ...Typography.display,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  btn: {
    marginTop: 16,
    backgroundColor: Brand.primaryDark,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
