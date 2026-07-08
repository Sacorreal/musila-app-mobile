export type PlanResource = 'tracks' | 'requests' | 'collaborators' | 'playlists';

export interface PlanLimitErrorPayload {
  error: 'PLAN_LIMIT_REACHED';
  resource: PlanResource;
  limit: number;
  current: number;
  upgradeRequired: 'pro';
}
