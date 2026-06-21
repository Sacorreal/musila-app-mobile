import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import ReAnimated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Brand, Typography } from '@/constants/theme';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { useCreateTrack } from '@/domains/tracks/hooks/use-tracks.hooks';
import { useUploadStorage } from '@/domains/storage/hooks/use-upload-storage.hooks';
import { StorageFolder } from '@/domains/storage/types/storage.types';
import { GenreSelectorMobile } from '@/domains/musical-genre/components/GenreSelectorMobile';
import { createTrackSchema } from '@/domains/tracks/validations/track.schema';

type FieldErrors = Partial<Record<string, string>>;

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
  keyboardType = 'default',
}: InputFieldProps) {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () =>
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const handleBlur = () =>
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? 'rgba(255,80,80,0.6)' : 'rgba(255,255,255,0.1)', Brand.accent],
  });

  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <Animated.View
        style={[
          fieldStyles.container,
          { borderColor },
          multiline && fieldStyles.containerMulti,
        ]}
      >
        <TextInput
          style={[fieldStyles.input, multiline && fieldStyles.inputMulti]}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.25)"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={multiline ? 5 : 1}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          selectionColor={Brand.accent}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </Animated.View>
      {!!error && <Text style={fieldStyles.error}>{error}</Text>}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 54,
    justifyContent: 'center',
  },
  containerMulti: {
    height: 120,
    paddingVertical: 12,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  inputMulti: {
    height: 96,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: 'rgba(255,85,85,0.9)',
    fontWeight: '500',
  },
});

interface ToggleFieldProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleField({ label, description, value, onChange }: ToggleFieldProps) {
  return (
    <View style={toggleStyles.row}>
      <View style={toggleStyles.text}>
        <Text style={toggleStyles.label}>{label}</Text>
        {!!description && <Text style={toggleStyles.desc}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: 'rgba(255,255,255,0.12)', true: `${Brand.primary}80` }}
        thumbColor={value ? Brand.accent : 'rgba(255,255,255,0.4)'}
      />
    </View>
  );
}

const toggleStyles = StyleSheet.create({
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

function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <ReAnimated.View entering={FadeInDown.springify()} style={successStyles.container}>
      <View style={successStyles.iconBox}>
        <MaterialCommunityIcons name="check-circle" size={64} color="#4ade80" />
      </View>
      <Text style={successStyles.title}>¡Canción publicada!</Text>
      <Text style={successStyles.subtitle}>Tu canción está en revisión y estará disponible pronto</Text>
      <Pressable style={successStyles.btn} onPress={onReset}>
        <Text style={successStyles.btnText}>Publicar otra canción</Text>
      </Pressable>
    </ReAnimated.View>
  );
}

const successStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  iconBox: {
    marginBottom: 8,
  },
  title: {
    ...Typography.display,
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  btn: {
    marginTop: 16,
    backgroundColor: Brand.primaryDark,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default function PublishScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const createTrack = useCreateTrack();
  const { uploadFiles, isUploading } = useUploadStorage();

  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState('');
  const [genreId, setGenreId] = useState('');
  const [subGenre, setSubGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [lyric, setLyric] = useState('');
  const [audioUri, setAudioUri] = useState('');
  const [coverUri, setCoverUri] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isGospel, setIsGospel] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const reset = () => {
    setTitle(''); setGenreId(''); setSubGenre(''); setLanguage('');
    setLyric(''); setAudioUri(''); setCoverUri('');
    setIsAvailable(true); setIsGospel(false); setErrors({});
    setSuccess(false);
  };

  const handleSubmit = async () => {
    const formState = { title, genreId, language, lyric, audioUri, coverUri: coverUri || undefined, isAvailable, isGospel, subGenre: subGenre || undefined };
    const result = createTrackSchema.safeParse(formState);

    if (!result.success) {
      const fmt: FieldErrors = {};
      result.error.errors.forEach((e) => {
        const key = e.path[0] as string;
        if (!fmt[key]) fmt[key] = e.message;
      });
      setErrors(fmt);
      Toast.show({ type: 'error', text1: 'Revisa los campos marcados' });
      return;
    }

    setErrors({});

    try {
      const filesToUpload = [
        { uri: result.data.audioUri, mimeType: 'audio/mpeg', folder: StorageFolder.TRACKS, field: 'audio' },
        ...(result.data.coverUri ? [{ uri: result.data.coverUri, mimeType: 'image/jpeg', folder: StorageFolder.COVERS, field: 'cover' }] : []),
      ];

      const uploaded = await uploadFiles(filesToUpload);
      const audioFile = uploaded.find((u) => u.field === 'audio');
      const coverFile = uploaded.find((u) => u.field === 'cover');

      if (!audioFile) throw new Error('No se pudo subir el audio');

      await createTrack.mutateAsync({
        title: result.data.title,
        genreId: result.data.genreId,
        subGenre: result.data.subGenre,
        language: result.data.language,
        lyric: result.data.lyric,
        isAvailable: result.data.isAvailable,
        isGospel: result.data.isGospel,
        authorsIds: user?.id ? [user.id] : [],
        audioKey: audioFile.key,
        audioUrl: audioFile.publicUrl,
        coverKey: coverFile?.key,
        coverUrl: coverFile?.publicUrl,
      });

      setSuccess(true);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo publicar',
        text2: err?.response?.data?.message ?? 'Intenta de nuevo',
      });
    }
  };

  const isPending = isUploading || createTrack.isPending;

  if (success) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <SuccessScreen onReset={reset} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Orbe decorativo */}
        <View style={styles.bgOrb} pointerEvents="none" />

        {/* Encabezado */}
        <ReAnimated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
          <Text style={styles.title}>Publicar</Text>
          <Text style={styles.subtitle}>Comparte tu música con el mundo</Text>
        </ReAnimated.View>

        {/* Formulario */}
        <ReAnimated.View entering={FadeInDown.delay(120).springify()}>
          <InputField
            label="Título *"
            placeholder="Nombre de la canción"
            value={title}
            onChangeText={(t) => { setTitle(t); setErrors((p) => ({ ...p, title: undefined })); }}
            error={errors.title}
          />

          {/* Género */}
          <View style={fieldStyles.wrapper}>
            <Text style={fieldStyles.label}>Género *</Text>
            <GenreSelectorMobile
              value={genreId}
              onChange={(id) => { setGenreId(id); setErrors((p) => ({ ...p, genreId: undefined })); }}
              error={errors.genreId}
            />
          </View>

          <InputField
            label="Subgénero"
            placeholder="Ej. Pop balada"
            value={subGenre}
            onChangeText={setSubGenre}
          />

          <InputField
            label="Idioma *"
            placeholder="Ej. Español"
            value={language}
            onChangeText={(t) => { setLanguage(t); setErrors((p) => ({ ...p, language: undefined })); }}
            error={errors.language}
          />

          <InputField
            label="Letra *"
            placeholder="Escribe la letra de la canción..."
            value={lyric}
            onChangeText={(t) => { setLyric(t); setErrors((p) => ({ ...p, lyric: undefined })); }}
            error={errors.lyric}
            multiline
          />

          <InputField
            label="URI del audio *"
            placeholder="URI o ruta del archivo de audio"
            value={audioUri}
            onChangeText={(t) => { setAudioUri(t); setErrors((p) => ({ ...p, audioUri: undefined })); }}
            error={errors.audioUri}
          />

          <InputField
            label="URI de la portada"
            placeholder="URI o ruta de la imagen de portada"
            value={coverUri}
            onChangeText={setCoverUri}
          />

          <ToggleField
            label="Disponible"
            description="Visible para intérpretes"
            value={isAvailable}
            onChange={setIsAvailable}
          />

          <ToggleField
            label="Es Gospel"
            description="Marca si la canción es de género gospel"
            value={isGospel}
            onChange={setIsGospel}
          />
        </ReAnimated.View>

        {/* Botón de publicar */}
        <ReAnimated.View entering={FadeInDown.delay(240).springify()} style={styles.submitSection}>
          <Pressable
            style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] }]}
            onPress={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.submitText}>
                  {isUploading ? 'Subiendo archivos...' : 'Publicando...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Publicar canción</Text>
            )}
          </Pressable>
          <Text style={styles.hint}>* Campos requeridos</Text>
        </ReAnimated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#080B12' },
  container: {
    flex: 1,
    backgroundColor: '#080B12',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  bgOrb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(32,138,239,0.06)',
    top: -60,
    right: -80,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 28,
    gap: 4,
  },
  title: {
    ...Typography.display,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.4)',
  },
  submitSection: {
    marginTop: 8,
    gap: 12,
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.primaryDark,
    // @ts-ignore
    experimental_backgroundImage: `linear-gradient(90deg, ${Brand.primaryDark}, ${Brand.accent})`,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  submitText: {
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
  hint: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
});
