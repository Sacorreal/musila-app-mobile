import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Brand, Typography } from '@/constants/theme';

interface AudioPickerFieldProps {
  uri: string;
  fileName: string;
  mimeType: string;
  onPick: (uri: string, name: string, mimeType: string, size?: number) => void;
  onClear: () => void;
  error?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const AUDIO_MIME_BY_EXTENSION: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/x-wav',
  m4a: 'audio/mp4',
  '3gp': 'audio/3gpp',
};

function inferAudioMimeType(fileName: string | undefined, reportedMimeType: string | null | undefined): string {
  if (reportedMimeType) return reportedMimeType;
  const extension = fileName?.split('.').pop()?.toLowerCase();
  return (extension && AUDIO_MIME_BY_EXTENSION[extension]) || 'audio/mpeg';
}

export function AudioPickerField({ uri, fileName, onPick, onClear, error }: AudioPickerFieldProps) {
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).catch(() => {});
  }, []);

  const player = useAudioPlayer(uri || null);
  const status = useAudioPlayerStatus(player);
  const [barWidth, setBarWidth] = useState(0);
  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  useEffect(() => {
    if (status.didJustFinish) {
      player.seekTo(0).catch(() => {});
    }
  }, [status.didJustFinish, player]);

  useEffect(() => {
    if (status.playing) {
      player.setActiveForLockScreen(true, { title: fileName });
    }
  }, [status.playing, fileName, player]);

  const handleSeek = (e: GestureResponderEvent) => {
    if (!barWidth || !status.duration) return;
    const ratio = Math.min(Math.max(e.nativeEvent.locationX / barWidth, 0), 1);
    player.seekTo(ratio * status.duration).catch(() => {});
  };

  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      onPick(asset.uri, asset.name, inferAudioMimeType(asset.name, asset.mimeType), asset.size);
    }
  };

  if (!uri) {
    return (
      <View style={styles.wrapper}>
        <Pressable
          style={({ pressed }) => [styles.emptyBox, !!error && styles.emptyBoxError, pressed && { opacity: 0.7 }]}
          onPress={handlePick}
        >
          <MaterialCommunityIcons name="music-note-plus" size={28} color={Brand.accent} />
          <Text style={styles.emptyLabel}>Seleccionar audio</Text>
          <Text style={styles.emptyHint}>MP3, WAV, AAC…</Text>
        </Pressable>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.selectedBox, !!error && styles.emptyBoxError]}>
        <Pressable
          style={({ pressed }) => [styles.playBtn, pressed && styles.playBtnPressed]}
          onPress={() => (status.playing ? player.pause() : player.play())}
          disabled={!status.isLoaded}
          hitSlop={8}
        >
          {status.isBuffering || !status.isLoaded ? (
            <ActivityIndicator size="small" color={Brand.accent} />
          ) : (
            <MaterialCommunityIcons
              name={status.playing ? 'pause' : 'play'}
              size={22}
              color={Brand.accent}
            />
          )}
        </Pressable>

        <View style={styles.infoColumn}>
          <View style={styles.fileNameRow}>
            <Text style={styles.fileName} numberOfLines={1}>
              {fileName}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.6 }]}
              onPress={onClear}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
            </Pressable>
          </View>

          <View style={styles.progressRow}>
            <Pressable
              style={styles.progressTrack}
              onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
              onPress={handleSeek}
              hitSlop={4}
            >
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </Pressable>
            <Text style={styles.timeText}>
              {formatTime(status.currentTime)} / {formatTime(status.duration)}
            </Text>
          </View>
        </View>
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  emptyBox: {
    height: 90,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(60,159,254,0.4)',
    backgroundColor: 'rgba(32,138,239,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyBoxError: { borderColor: 'rgba(255,80,80,0.6)' },
  emptyLabel: { ...Typography.label, color: Brand.accent, fontWeight: '600' },
  emptyHint: { ...Typography.caption, color: 'rgba(255,255,255,0.3)' },
  selectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(60,159,254,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(32,138,239,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  playBtnPressed: { opacity: 0.7 },
  infoColumn: { flex: 1, gap: 6 },
  fileNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fileName: { ...Typography.label, color: '#FFFFFF', flex: 1, fontWeight: '500' },
  clearBtn: { flexShrink: 0 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Brand.accent,
  },
  timeText: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.5)',
    flexShrink: 0,
    minWidth: 72,
    textAlign: 'right',
  },
  errorText: { ...Typography.caption, color: 'rgba(255,85,85,0.9)', marginTop: 6 },
});
