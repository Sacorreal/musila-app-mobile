import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

interface SearchEmptyStateProps {
  hasQuery: boolean;
}

export function SearchEmptyState({ hasQuery }: SearchEmptyStateProps) {
  const theme = useTheme();

  if (!hasQuery) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="magnify" size={48} color={theme.textSecondary} />
        <Text style={[styles.title, { color: theme.text }]}>Busca canciones, artistas o géneros</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Escribe al menos 2 caracteres para buscar
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="music-note-off-outline" size={48} color={theme.textSecondary} />
      <Text style={[styles.title, { color: theme.text }]}>Sin resultados</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Intenta con otro término de búsqueda
      </Text>
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
});
