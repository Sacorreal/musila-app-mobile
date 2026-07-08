const WEB_APP_URL = process.env.EXPO_PUBLIC_WEB_APP_URL ?? 'https://musila.co';

export function getPublicTrackUrl(trackId: string): string {
  return `${WEB_APP_URL}/music/tracks/${trackId}`;
}
