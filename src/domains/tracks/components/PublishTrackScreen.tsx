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
import { useGenres } from '@/domains/musical-genre/hooks/use-musical-genre.hooks';
import { createTrackSchema } from '@/domains/tracks/validations/track.schema';
import { PublishSuccessScreen } from '@/domains/tracks/components/PublishSuccessScreen';
import { FormInput } from '@/shared/components/ui/FormInput';
import { FormToggle } from '@/shared/components/ui/FormToggle';
import { SubGenreSelectorMobile } from './SubGenreSelectorMobile';
import { LanguageSelectorMobile } from './LanguageSelectorMobile';
import { AudioPickerField } from './AudioPickerField';
import { CoverPickerField } from './CoverPickerField';
import { IntellectualPropertyFormSection, type IPEntry } from './IntellectualPropertyFormSection';
import { useMiniPlayerSpacing } from '@/domains/player/hooks/use-mini-player-spacing';
import { isPlanLimitError } from '@/shared/utils/planLimitError';
import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';

type FieldErrors = Partial<Record<string, string>>;

export function PublishTrackScreen() {
  const insets = useSafeAreaInsets();
  const miniPlayerSpacing = useMiniPlayerSpacing();
  const user = useAuthStore((s) => s.user);
  const createTrack = useCreateTrack();
  const { uploadFiles, rollback, isUploading } = useUploadStorage();
  const { data: genres = [] } = useGenres();

  const [success, setSuccess] = useState(false);
  const [publishedTrack, setPublishedTrack] = useState<TracksResponseDto | null>(null);

  const [title, setTitle] = useState('');
  const [genreId, setGenreId] = useState('');
  const [subGenre, setSubGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [lyric, setLyric] = useState('');
  const [audioUri, setAudioUri] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [audioMimeType, setAudioMimeType] = useState('audio/mpeg');
  const [coverUri, setCoverUri] = useState('');
  const [coverMimeType, setCoverMimeType] = useState('image/jpeg');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isGospel, setIsGospel] = useState(false);
  const [ipEntries, setIpEntries] = useState<IPEntry[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  const selectedGenre = genres.find((g) => g.id === genreId);
  const availableSubGenres = selectedGenre?.subGenre ?? [];

  const reset = () => {
    setTitle(''); setGenreId(''); setSubGenre(''); setLanguage('');
    setLyric(''); setAudioUri(''); setAudioFileName(''); setAudioMimeType('audio/mpeg');
    setCoverUri(''); setCoverMimeType('image/jpeg'); setIsAvailable(true); setIsGospel(false);
    setIpEntries([]); setErrors({});
    setSuccess(false);
    setPublishedTrack(null);
  };

  const handleSubmit = async () => {
    // Validate IP entries first (show specific errors in context)
    for (let i = 0; i < ipEntries.length; i++) {
      const ip = ipEntries[i];
      if (ip.type !== 'splitSheet' && !ip.key) {
        Toast.show({ type: 'error', text1: 'Propiedad intelectual incompleta', text2: `Entrada ${i + 1}: selecciona una opción` });
        return;
      }
      if (!ip.documentUri) {
        Toast.show({ type: 'error', text1: 'Propiedad intelectual incompleta', text2: `Entrada ${i + 1}: adjunta el documento PDF` });
        return;
      }
    }

    const formState = {
      title, genreId, language, lyric, audioUri,
      coverUri: coverUri || undefined,
      isAvailable, isGospel,
      subGenre: subGenre || undefined,
    };
    const result = createTrackSchema.safeParse(formState);

    if (!result.success) {
      const fmt: FieldErrors = {};
      result.error.issues.forEach((e) => {
        const key = e.path[0] as string;
        if (!fmt[key]) fmt[key] = e.message;
      });
      setErrors(fmt);
      Toast.show({ type: 'error', text1: 'Revisa los campos marcados' });
      return;
    }

    setErrors({});

    let uploaded: { field: string; key: string; publicUrl: string }[] = [];

    try {
      const filesToUpload = [
        { uri: result.data.audioUri, mimeType: audioMimeType, folder: StorageFolder.TRACKS, field: 'audio' },
        ...(result.data.coverUri ? [{ uri: result.data.coverUri, mimeType: coverMimeType, folder: StorageFolder.COVERS, field: 'cover' }] : []),
        ...ipEntries.map((ip, idx) => ({
          uri: ip.documentUri,
          mimeType: 'application/pdf',
          folder: StorageFolder.INTELLECTUAL_PROPERTY,
          field: `ip_${idx}`,
        })),
      ];

      uploaded = await uploadFiles(filesToUpload);
      const audioFile = uploaded.find((u) => u.field === 'audio');
      const coverFile = uploaded.find((u) => u.field === 'cover');

      if (!audioFile) throw new Error('No se pudo subir el audio');

      const created = await createTrack.mutateAsync({
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
        intellectualProperties: ipEntries.map((ip, idx) => {
          const ipFile = uploaded.find((u) => u.field === `ip_${idx}`);
          return {
            type: ip.type,
            key: ip.key,
            documentKey: ipFile!.key,
            documentUrl: ipFile!.publicUrl,
          };
        }),
      });

      setPublishedTrack(created);
      setSuccess(true);
    } catch (err: any) {
      if (uploaded.length > 0) {
        rollback(uploaded.map((u) => u.key)).catch(() => {});
      }
      console.error('[PublishTrackScreen] handleSubmit failed:', err);
      if (!isPlanLimitError(err)) {
        Toast.show({
          type: 'error',
          text1: 'No se pudo publicar',
          text2: err?.response?.data?.message ?? err?.message ?? 'Intenta de nuevo',
        });
      }
    }
  };

  const isPending = isUploading || createTrack.isPending;

  if (success) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <PublishSuccessScreen onReset={reset} track={publishedTrack} />
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
        contentContainerStyle={[styles.content, { paddingBottom: 60 + miniPlayerSpacing }]}
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

          {/* Género */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Género *</Text>
            <GenreSelectorMobile
              value={genreId}
              onChange={(id) => {
                setGenreId(id);
                setSubGenre('');
                setErrors((p) => ({ ...p, genreId: undefined }));
              }}
              error={errors.genreId}
            />
          </View>

          {/* Subgénero — solo si el género tiene subgéneros */}
          {availableSubGenres.length > 0 && (
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>Subgénero</Text>
              <SubGenreSelectorMobile
                subGenres={availableSubGenres}
                value={subGenre}
                onChange={setSubGenre}
              />
            </View>
          )}

          {/* Idioma */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Idioma *</Text>
            <LanguageSelectorMobile
              value={language}
              onChange={(code) => { setLanguage(code); setErrors((p) => ({ ...p, language: undefined })); }}
              error={errors.language}
            />
          </View>

          <FormInput
            label="Letra *"
            placeholder="Escribe la letra de la canción..."
            value={lyric}
            onChangeText={(t) => { setLyric(t); setErrors((p) => ({ ...p, lyric: undefined })); }}
            error={errors.lyric}
            multiline
          />

          {/* Audio */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Audio *</Text>
            <AudioPickerField
              uri={audioUri}
              fileName={audioFileName}
              mimeType={audioMimeType}
              onPick={(uri, name, mime) => {
                setAudioUri(uri);
                setAudioFileName(name);
                setAudioMimeType(mime);
                setErrors((p) => ({ ...p, audioUri: undefined }));
              }}
              onClear={() => { setAudioUri(''); setAudioFileName(''); setAudioMimeType('audio/mpeg'); }}
              error={errors.audioUri}
            />
          </View>

          {/* Portada */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Portada</Text>
            <CoverPickerField
              uri={coverUri}
              onPick={(uri, mimeType) => { setCoverUri(uri); setCoverMimeType(mimeType); }}
              onClear={() => { setCoverUri(''); setCoverMimeType('image/jpeg'); }}
            />
          </View>

          {/* Propiedad Intelectual */}
          <IntellectualPropertyFormSection
            entries={ipEntries}
            onChange={setIpEntries}
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
  fieldWrapper: {
    marginBottom: 18,
  },
  fieldLabel: {
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
