import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface MenuOption {
  icon: IconName;
  label: string;
  description: string;
  action: () => void;
  danger?: boolean;
}

export function MoreMenuCard({ icon, label, description, action, danger }: MenuOption) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
      onPress={action}
    >
      <View style={[styles.iconBox, danger && styles.iconBoxDanger]}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={danger ? 'rgba(255,80,80,0.9)' : Brand.accent}
        />
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.cardLabel, danger && styles.cardLabelDanger]}>{label}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.25)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(32,138,239,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconBoxDanger: {
    backgroundColor: 'rgba(255,80,80,0.1)',
  },
  cardText: {
    flex: 1,
    gap: 3,
  },
  cardLabel: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardLabelDanger: {
    color: 'rgba(255,80,80,0.9)',
  },
  cardDesc: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.4)',
  },
});
