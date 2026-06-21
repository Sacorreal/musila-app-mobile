import { StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

interface SearchEmptyStateProps {
  hasQuery: boolean;
}

export function SearchEmptyState({ hasQuery }: SearchEmptyStateProps) {
  if (!hasQuery) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🔍</Text>
        <Text style={styles.title}>Busca canciones</Text>
        <Text style={styles.subtitle}>Escribe al menos 2 caracteres para buscar</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎵</Text>
      <Text style={styles.title}>Sin resultados</Text>
      <Text style={styles.subtitle}>Intenta con otro término de búsqueda</Text>
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
  icon: {
    fontSize: 48,
    marginBottom: 4,
  },
  title: {
    ...Typography.title,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
