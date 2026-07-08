import { useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';
import { getPublicTrackUrl } from '@/domains/tracks/utils/track-share.utils';
import { STORY_CAPTURE_HEIGHT, STORY_CAPTURE_WIDTH } from '@/domains/tracks/components/ShareStoryCard';

export type ShareInstagramStoryResult = 'shared' | 'not-installed' | 'cancelled' | 'error';

interface UseShareInstagramStoryResult {
  cardRef: React.RefObject<View | null>;
  localCoverUri: string | null;
  isPreparing: boolean;
  isSharing: boolean;
  error: string | null;
  prepareCover: (coverUrl: string | null) => Promise<void>;
  share: (track: TracksResponseDto) => Promise<ShareInstagramStoryResult>;
}

export function useShareInstagramStory(): UseShareInstagramStoryResult {
  const cardRef = useRef<View>(null);
  const [localCoverUri, setLocalCoverUri] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prepareCover = async (coverUrl: string | null) => {
    if (!coverUrl) {
      setLocalCoverUri(null);
      return;
    }
    setIsPreparing(true);
    setError(null);
    try {
      const ext = coverUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const dest = `${FileSystem.cacheDirectory}share-cover-${Date.now()}.${ext}`;
      const { uri } = await FileSystem.downloadAsync(coverUrl, dest);
      setLocalCoverUri(uri);
    } catch {
      // Si falla la descarga, se comparte igual con el fallback visual del componente
      setLocalCoverUri(null);
    } finally {
      setIsPreparing(false);
    }
  };

  const share = async (track: TracksResponseDto): Promise<ShareInstagramStoryResult> => {
    setIsSharing(true);
    setError(null);
    try {
      const capturedUri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: STORY_CAPTURE_WIDTH,
        height: STORY_CAPTURE_HEIGHT,
      });

      const backgroundImage =
        Platform.OS === 'android' ? `file://${capturedUri.replace('file://', '')}` : capturedUri;

      await Share.shareSingle({
        social: Share.Social.INSTAGRAM_STORIES,
        backgroundImage,
        attributionURL: getPublicTrackUrl(track.id),
        backgroundBottomColor: '#080B12',
        backgroundTopColor: '#111827',
      } as any);

      return 'shared';
    } catch (e: any) {
      const message: string = e?.message ?? '';
      if (/not installed|activitynotfound|no activity|unable to open/i.test(message)) {
        setError('Instagram no está instalado en este dispositivo');
        return 'not-installed';
      }
      if (/cancel/i.test(message)) return 'cancelled';
      console.error('[useShareInstagramStory] share failed:', e);
      setError('No se pudo compartir la historia. Intenta de nuevo');
      return 'error';
    } finally {
      setIsSharing(false);
    }
  };

  return { cardRef, localCoverUri, isPreparing, isSharing, error, prepareCover, share };
}
