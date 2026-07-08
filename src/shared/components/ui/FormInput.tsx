import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Brand } from '@/constants/theme';

export interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  rightElement?: React.ReactNode;
}

export function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'none',
  rightElement,
}: FormInputProps) {
  const focusProgress = useSharedValue(0);

  const handleFocus = () => {
    focusProgress.value = withTiming(1, { duration: 200 });
  };
  const handleBlur = () => {
    focusProgress.value = withTiming(0, { duration: 200 });
  };

  const restColor = error ? 'rgba(255,80,80,0.6)' : 'rgba(255,255,255,0.1)';
  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focusProgress.value, [0, 1], [restColor, Brand.accent]),
  }));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.container, animatedBorderStyle, multiline && styles.containerMulti]}>
        <TextInput
          style={[styles.input, multiline && styles.inputMulti]}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={multiline ? 5 : 1}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          selectionColor={Brand.accent}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </Animated.View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 54,
  },
  containerMulti: {
    height: 120,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
  },
  inputMulti: {
    height: 96,
  },
  rightElement: {
    paddingLeft: 12,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: 'rgba(255,85,85,0.9)',
    fontWeight: '500',
  },
});
