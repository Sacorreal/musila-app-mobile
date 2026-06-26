import { StyleSheet, Switch, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';

export interface FormToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

export function FormToggle({ label, description, value, onValueChange }: FormToggleProps) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {!!description && <Text style={styles.desc}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255,255,255,0.12)', true: `${Brand.primary}80` }}
        thumbColor={value ? Brand.accent : 'rgba(255,255,255,0.4)'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  text: { flex: 1, marginRight: 12 },
  label: { ...Typography.label, color: '#FFFFFF', fontWeight: '600' },
  desc: { ...Typography.caption, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
});
