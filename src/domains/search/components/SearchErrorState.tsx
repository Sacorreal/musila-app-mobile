import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

interface SearchErrorStateProps {
  onRetry: () => void;
}

export function SearchErrorState({ onRetry }: SearchErrorStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="wifi-off" size={48} color={theme.textSecondary} />
      <Text style={[styles.title, { color: theme.text }]}>No pudimos completar la búsqueda</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Revisa tu conexión e intenta de nuevo
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
        onPress={onRetry}
      >
        <Text style={styles.buttonText}>Reintentar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  title: {
    ...Typography.title,
    fontWeight: '600',
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  button: {
    marginTop: 12,
    backgroundColor: Brand.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
