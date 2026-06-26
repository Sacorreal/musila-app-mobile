import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import { PublishSuccessScreen } from '@/domains/tracks/components/PublishSuccessScreen';
import { FormInput } from '@/shared/components/ui/FormInput';
import { FormToggle } from '@/shared/components/ui/FormToggle';

type FieldErrors = Partial<Record<string, string>>;

export function PublishTrackScreen() {
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
    const formState = {
      title, genreId, language, lyric, audioUri,
      coverUri: coverUri || undefined,
      isAvailable, isGospel,
      subGenre: subGenre || undefined,
    };
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
        <PublishSuccessScreen onReset={reset} />
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
        <View style={styles.bgOrb} pointerEvents="none" />

        <ReAnimated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
          <Text style={styles.title}>Publicar</Text>
          <Text style={styles.subtitle}>Comparte tu música con el mundo</Text>
        </ReAnimated.View>

        <ReAnimated.View entering={FadeInDown.delay(120).springify()}>
          <FormInput
            label="Título *"
            placeholder="Nombre de la canción"
            value={title}
            onChangeText={(t) => { setTitle(t); setErrors((p) => ({ ...p, title: undefined })); }}
            error={errors.title}
          />

          <View style={styles.genreWrapper}>
            <Text style={styles.genreLabel}>Género *</Text>
            <GenreSelectorMobile
              value={genreId}
              onChange={(id) => { setGenreId(id); setErrors((p) => ({ ...p, genreId: undefined })); }}
              error={errors.genreId}
            />
          </View>

          <FormInput
            label="Subgénero"
            placeholder="Ej. Pop balada"
            value={subGenre}
            onChangeText={setSubGenre}
          />

          <FormInput
            label="Idioma *"
            placeholder="Ej. Español"
            value={language}
            onChangeText={(t) => { setLanguage(t); setErrors((p) => ({ ...p, language: undefined })); }}
            error={errors.language}
          />

          <FormInput
            label="Letra *"
            placeholder="Escribe la letra de la canción..."
            value={lyric}
            onChangeText={(t) => { setLyric(t); setErrors((p) => ({ ...p, lyric: undefined })); }}
            error={errors.lyric}
            multiline
          />

          <FormInput
            label="URI del audio *"
            placeholder="URI o ruta del archivo de audio"
            value={audioUri}
            onChangeText={(t) => { setAudioUri(t); setErrors((p) => ({ ...p, audioUri: undefined })); }}
            error={errors.audioUri}
          />

          <FormInput
            label="URI de la portada"
            placeholder="URI o ruta de la imagen de portada"
            value={coverUri}
            onChangeText={setCoverUri}
          />

          <FormToggle
            label="Disponible"
            description="Visible para intérpretes"
            value={isAvailable}
            onValueChange={setIsAvailable}
          />

          <FormToggle
            label="Es Gospel"
            description="Marca si la canción es de género gospel"
            value={isGospel}
            onValueChange={setIsGospel}
          />
        </ReAnimated.View>

        <ReAnimated.View entering={FadeInDown.delay(240).springify()} style={styles.submitSection}>
          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
            ]}
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
  genreWrapper: {
    marginBottom: 18,
  },
  genreLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
    textTransform: 'uppercase',
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
