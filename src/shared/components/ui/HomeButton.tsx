import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

export function HomeButton() {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}
      onPress={() => router.push('/(tabs)' as any)}
      hitSlop={12}
    >
      <MaterialCommunityIcons name="home-outline" size={20} color="rgba(255,255,255,0.7)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
