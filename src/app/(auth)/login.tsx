import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from 'react-native';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Brand } from '@/constants/theme';
import { useLogin } from '@/domains/auth/hooks/use-auth.hooks';
import { loginSchema } from '@/domains/auth/validations/auth.schema';

// ─── InputField ──────────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  rightElement?: React.ReactNode;
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'none',
  rightElement,
}: InputFieldProps) {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () =>
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();

  const handleBlur = () =>
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? 'rgba(255,80,80,0.6)' : 'rgba(255,255,255,0.1)',
      Brand.accent,
    ],
  });

  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <Animated.View style={[fieldStyles.container, { borderColor }]}>
        <TextInput
          style={fieldStyles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          selectionColor={Brand.accent}
        />
        {rightElement && <View style={fieldStyles.right}>{rightElement}</View>}
      </Animated.View>
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
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
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
    height: '100%',
  },
  right: {
    paddingLeft: 12,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: 'rgba(255, 85, 85, 0.9)',
    fontWeight: '500',
  },
});

// ─── LoginScreen ─────────────────────────────────────────────────────────────

type FieldErrors = { citizenID?: string; password?: string };

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const loginMutation = useLogin();

  const [citizenID, setCitizenID] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = () => {
    const result = loginSchema.safeParse({ citizenID, password });
    if (!result.success) {
      const fmt = result.error.format();
      setFieldErrors({
        citizenID: fmt.citizenID?._errors[0],
        password: fmt.password?._errors[0],
      });
      return;
    }
    setFieldErrors({});
    loginMutation.mutate(result.data, {
      onError: (err: unknown) => {
        const message =
          (err as any)?.response?.data?.message ?? 'Verifica tus credenciales e intenta de nuevo';
        Toast.show({ type: 'error', text1: 'Error al iniciar sesión', text2: message });
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Decoración de fondo */}
        <View style={styles.bgOrb1} pointerEvents="none" />
        <View style={styles.bgOrb2} pointerEvents="none" />

        {/* ── Logotipo ── */}
        <ReAnimated.View entering={FadeInDown.delay(0).springify()} style={styles.logoSection}>
          <View style={styles.glowRing} />
          <View style={styles.iconWrapper}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.icon}
              contentFit="contain"
            />
          </View>
        </ReAnimated.View>

        {/* ── Título ── */}
        <ReAnimated.View entering={FadeInDown.delay(120).springify()} style={styles.titleSection}>
          <Text style={styles.brandName}>MUSILA</Text>
          <View style={styles.accentBar} />
          <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
        </ReAnimated.View>

        {/* ── Formulario ── */}
        <ReAnimated.View entering={FadeInDown.delay(260).springify()} style={styles.form}>
          <InputField
            label="Número de documento"
            placeholder="Ej. 1234567890"
            value={citizenID}
            onChangeText={(t) => { setCitizenID(t); clearError('citizenID'); }}
            error={fieldErrors.citizenID}
            keyboardType="default"
          />

          <InputField
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={(t) => { setPassword(t); clearError('password'); }}
            error={fieldErrors.password}
            secureTextEntry={!passwordVisible}
            rightElement={
              <TouchableOpacity
                onPress={() => setPasswordVisible((v) => !v)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <SymbolView
                  name={passwordVisible ? 'eye.slash' : 'eye'}
                  size={18}
                  tintColor="rgba(255,255,255,0.4)"
                  fallback={
                    <Text style={styles.eyeFallback}>
                      {passwordVisible ? 'OCULTAR' : 'VER'}
                    </Text>
                  }
                />
              </TouchableOpacity>
            }
          />

          <Link href={'/(auth)/forgot-password' as any} asChild>
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </Link>
        </ReAnimated.View>

        {/* ── Botón ── */}
        <ReAnimated.View entering={FadeInDown.delay(400).springify()} style={styles.buttonSection}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleSubmit}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.buttonText}>Iniciando sesión…</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
          </Pressable>
        </ReAnimated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const ICON_SIZE = 96;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#080B12' },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
  },

  // Decoración de fondo
  bgOrb1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(32,138,239,0.07)',
    top: -80,
    right: -100,
  },
  bgOrb2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(60,159,254,0.05)',
    bottom: 100,
    left: -60,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 28,
  },
  glowRing: {
    position: 'absolute',
    width: ICON_SIZE + 56,
    height: ICON_SIZE + 56,
    borderRadius: (ICON_SIZE + 56) / 2,
    backgroundColor: 'rgba(32,138,239,0.18)',
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 40,
  },
  iconWrapper: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },

  // Título
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  accentBar: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: Brand.primary,
    marginTop: 10,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // Formulario
  form: {
    marginBottom: 8,
  },

  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    color: Brand.accent,
    fontWeight: '500',
  },

  // Eye fallback (Android)
  eyeFallback: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Botón
  buttonSection: {
    marginTop: 28,
  },
  button: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.primaryDark,
    // @ts-ignore — gradiente lineal (nueva arquitectura RN)
    experimental_backgroundImage: `linear-gradient(90deg, ${Brand.primaryDark}, ${Brand.accent})`,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
