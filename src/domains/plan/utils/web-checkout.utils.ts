const WEB_APP_URL = process.env.EXPO_PUBLIC_WEB_APP_URL ?? 'https://musila.co';

export function getPricingUrl(): string {
  return `${WEB_APP_URL}/#pricing`;
}
