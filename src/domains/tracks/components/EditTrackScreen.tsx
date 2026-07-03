import { useEffect, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Brand, Typography } from '@/constants/theme';
import { useTrackById, useUpdateTrack } from '@/domains/tracks/hooks/use-tracks.hooks';
import { resolveGenreName } from '@/domains/tracks/utils/resolveGenreName';
import { GenreSelectorMobile } from '@/domains/musical-genre/components/GenreSelectorMobile';
import { FormInput } from '@/shared/components/ui/FormInput';
import { FormToggle } from '@/shared/components/ui/FormToggle';
import { HomeButton } from '@/shared/components/ui/HomeButton';

type FieldErrors = Partial<Record<string, string>>;

export function EditTrackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: track, isLoading } = useTrackById(id ?? '');
  const updateTrack = useUpdateTrack();

  const [title, setTitle] = useState('');
  const [genreId, setGenreId] = useState('');
  const [subGenre, setSubGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [lyric, setLyric] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isGospel, setIsGospel] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (track && !initialized) {
      setTitle(track.title ?? '');
      setSubGenre(track.subGenre ?? '');
      setLanguage(track.language ?? '');
      setLyric(track.lyric ?? '');
      setIsAvailable(track.isAvailable ?? true);
      setIsGospel(track.isGospel ?? false);
      setInitialized(true);
    }
  }, [track, initialized]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrors({ title: 'El título es requerido' });
      Toast.show({ type: 'error', text1: 'Revisa los campos marcados' });
      return;
    }
    if (!language.trim()) {
      setErrors({ language: 'El idioma es requerido' });
      Toast.show({ type: 'error', text1: 'Revisa los campos marcados' });
      return;
    }
    if (!lyric.trim()) {
      setErrors({ lyric: 'La letra es requerida' });
      Toast.show({ type: 'error', text1: 'Revisa los campos marcados' });
      return;
    }

    setErrors({});

    const payload: Record<string, unknown> = {
      title: title.trim(),
      language: language.trim(),
      lyric: lyric.trim(),
      subGenre: subGenre.trim() || undefined,
      isAvailable,
      isGospel,
    };
    if (genreId) payload.genreId = genreId;

    try {
      await updateTrack.mutateAsync({ id: id!, data: payload });
      Toast.show({ type: 'success', text1: 'Canción actualizada' });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'No se pudo actualizar',
        text2: err?.response?.data?.message ?? 'Intenta de nuevo',
      });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Brand.primary} size="large" />
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
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            onPress={() => router.back()}
            hitSlop={12}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Editar canción</Text>
            <Text style={styles.subtitle}>Actualiza la información del track</Text>
          </View>
          <HomeButton />
        </ReAnimated.View>

        <ReAnimated.View entering={FadeInDown.delay(80).springify()}>
          <FormInput
            label="Título *"
            placeholder="Nombre de la canción"
            value={title}
            onChangeText={(t) => { setTitle(t); setErrors((p) => ({ ...p, title: undefined })); }}
            error={errors.title}
          />

          <View style={styles.genreWrapper}>
            <Text style={styles.genreLabel}>Género</Text>
            <GenreSelectorMobile
              value={genreId || undefined}
              onChange={(id) => setGenreId(id)}
              error={errors.genreId}
            />
            {!genreId && !!track?.genre && (
              <Text style={styles.currentValue}>Actual: {resolveGenreName(track.genre)}</Text>
            )}
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

        <ReAnimated.View entering={FadeInDown.delay(200).springify()} style={styles.submitSection}>
          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
            ]}
            onPress={handleSubmit}
            disabled={updateTrack.isPending}
          >
            {updateTrack.isPending ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.submitText}>Guardando...</Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Guardar cambios</Text>
            )}
          </Pressable>
        </ReAnimated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#080B12' },
  container: { flex: 1, backgroundColor: '#080B12' },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#080B12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 24, paddingBottom: 60 },
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
    paddingTop: 16,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  titleWrapper: {
    flex: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  title: {
    ...Typography.display,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 26,
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  genreWrapper: { marginBottom: 18 },
  genreLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  currentValue: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 6,
    fontStyle: 'italic',
  },
  submitSection: { marginTop: 8, gap: 12 },
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
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
