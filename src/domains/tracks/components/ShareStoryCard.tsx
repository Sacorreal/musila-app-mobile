import { forwardRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Brand, Typography } from '@/constants/theme';

export const STORY_CARD_WIDTH = 360;
export const STORY_CARD_HEIGHT = 640;
export const STORY_CAPTURE_WIDTH = 1080;
export const STORY_CAPTURE_HEIGHT = 1920;

interface ShareStoryCardProps {
  title: string;
  authorName?: string;
  /** Debe ser un URI local (file://) ya descargado — nunca una URL remota. */
  localCoverUri: string | null;
  onCoverLoadEnd?: () => void;
}

export const ShareStoryCard = forwardRef<View, ShareStoryCardProps>(
  ({ title, authorName, localCoverUri, onCoverLoadEnd }, ref) => {
    return (
      <View ref={ref} style={styles.card} collapsable={false}>
        <View style={styles.coverWrapper}>
          {localCoverUri ? (
            <Image
              source={{ uri: localCoverUri }}
              style={styles.cover}
              resizeMode="cover"
              onLoadEnd={onCoverLoadEnd}
            />
          ) : (
            <View style={[styles.cover, styles.coverFallback]} />
          )}
          <View style={styles.coverShade} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {!!authorName && (
            <Text style={styles.author} numberOfLines={1}>
              {authorName}
            </Text>
          )}
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>Musila</Text>
          </View>
        </View>
      </View>
    );
  },
);

ShareStoryCard.displayName = 'ShareStoryCard';

const styles = StyleSheet.create({
  card: {
    width: STORY_CARD_WIDTH,
    height: STORY_CARD_HEIGHT,
    backgroundColor: '#080B12',
    justifyContent: 'space-between',
  },
  coverWrapper: {
    width: STORY_CARD_WIDTH,
    height: STORY_CARD_WIDTH,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverFallback: {
    backgroundColor: '#111827',
  },
  coverShade: {
    ...StyleSheet.absoluteFill,
    // @ts-ignore — mismo patrón experimental_backgroundImage usado en EditTrackScreen.tsx
    experimental_backgroundImage: 'linear-gradient(180deg, rgba(8,11,18,0) 60%, rgba(8,11,18,1) 100%)',
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    gap: 8,
  },
  title: {
    ...Typography.display,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  author: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.6)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.accent,
  },
  brandText: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
