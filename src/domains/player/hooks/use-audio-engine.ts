import { useEffect, useRef } from 'react';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { usePlayerStore } from '@/shared/stores/player.store';

export interface AudioEngineControls {
  seekTo: (seconds: number) => void;
}

export function useAudioEngine(): AudioEngineControls {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const queue = usePlayerStore((s) => s.queue);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const setProgress = usePlayerStore((s) => s.setProgress);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const skipNext = usePlayerStore((s) => s.skipNext);

  const lastTrackIdRef = useRef<string | null>(null);
  const pendingPlayRef = useRef(false);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!currentTrack) {
      if (lastTrackIdRef.current) {
        player.pause();
        player.clearLockScreenControls();
        lastTrackIdRef.current = null;
      }
      return;
    }
    if (currentTrack.id === lastTrackIdRef.current || !currentTrack.audioUrl) return;

    lastTrackIdRef.current = currentTrack.id;
    pendingPlayRef.current = true;
    player.replace({ uri: currentTrack.audioUrl });
    player.play();
    player.setActiveForLockScreen(true, {
      title: currentTrack.title,
      artist: currentTrack.artist,
      artworkUrl: currentTrack.albumArt,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  useEffect(() => {
    if (isPlaying && !player.playing) player.play();
    if (!isPlaying && player.playing) player.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  useEffect(() => {
    if (status.playing) pendingPlayRef.current = false;
    // Mientras el nuevo track carga, status.playing=false no debe pausar el store
    if (pendingPlayRef.current && !status.playing) return;
    if (status.playing !== usePlayerStore.getState().isPlaying) {
      setPlaying(status.playing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.playing]);

  useEffect(() => {
    setProgress(status.currentTime);
    if (status.duration > 0) setDuration(status.duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.currentTime, status.duration]);

  useEffect(() => {
    if (!status.didJustFinish || !currentTrack) return;
    if (queue.length > 0) {
      skipNext();
    } else {
      setPlaying(false);
      player.seekTo(0).catch(() => {});
      setProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.didJustFinish]);

  return {
    seekTo: (seconds: number) => {
      player.seekTo(seconds).catch(() => {});
    },
  };
}
