import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';

interface SearchSeeAllRowProps {
  label: string;
  total: number;
  onPress: () => void;
}

export function SearchSeeAllRow({ label, total, onPress }: SearchSeeAllRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <View style={styles.textWrapper}>
        <Text style={styles.label}>
          {label} ({total})
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={Brand.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  textWrapper: {
    flex: 1,
  },
  label: {
    ...Typography.label,
    color: Brand.primary,
    fontWeight: '700',
  },
});
