import { useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabInset } from '@/constants/theme';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { RequestUseModal } from '@/domains/tracks/components/RequestUseModal';
import { useTrackById } from '@/domains/tracks/hooks/use-tracks.hooks';
import { UserRole } from '@/domains/users/types/users.types';
import { usePlayerStore } from '@/shared/stores/player.store';
import { useAudioEngine } from '../hooks/use-audio-engine';
import { FullPlayerModal } from './FullPlayerModal';
import { MiniPlayer } from './MiniPlayer';

export function GlobalPlayer() {
  const engine = useAudioEngine();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const reset = usePlayerStore((s) => s.reset);

  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const userId = user?.id;

  const { data: fullTrack } = useTrackById(currentTrack?.id ?? '');

  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    if (!user) reset();
  }, [user, reset]);

  const inAuthGroup = (segments[0] as string) === '(auth)';
  if (!currentTrack || inAuthGroup) return null;

  const isOwner =
    !!fullTrack &&
    Array.isArray(fullTrack.authors) &&
    fullTrack.authors.some((a) => typeof a !== 'string' && a.id === userId);
  const canRequestUse = !!fullTrack && role !== UserRole.INVITADO && !isOwner;
  const canAddToPlaylist = role !== UserRole.AUTOR;

  const inTabs = (segments[0] as string) === '(tabs)';
  const bottom = inTabs ? insets.bottom + BottomTabInset + 8 : insets.bottom + 8;

  return (
    <>
      <MiniPlayer
        bottom={bottom}
        canRequestUse={canRequestUse}
        onRequestUse={() => setShowRequestModal(true)}
      />

      <FullPlayerModal
        track={fullTrack}
        canRequestUse={canRequestUse}
        canAddToPlaylist={canAddToPlaylist}
        onSeek={engine.seekTo}
      />

      {canRequestUse && !!fullTrack && (
        <RequestUseModal
          visible={showRequestModal}
          track={fullTrack}
          onClose={() => setShowRequestModal(false)}
        />
      )}
    </>
  );
}
