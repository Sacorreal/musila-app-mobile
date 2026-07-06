import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Brand } from '@/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Buscar canciones, artistas o géneros...',
}: SearchBarProps) {
  const theme = useTheme();
  const focusProgress = useSharedValue(0);

  const handleFocus = () => {
    focusProgress.value = withTiming(1, { duration: 200 });
  };
  const handleBlur = () => {
    focusProgress.value = withTiming(0, { duration: 200 });
  };

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [theme.backgroundElement, Brand.accent],
    ),
  }));

  const handleClear = () => onChangeText('');

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: theme.backgroundElement }, animatedBorderStyle]}
    >
      <MaterialCommunityIcons name="magnify" size={20} color={theme.textSecondary} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        selectionColor={Brand.accent}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="close-circle" size={18} color={theme.textSecondary} />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
});
