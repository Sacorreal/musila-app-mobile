import type { PlanResource } from '@/shared/types/plan-limit.types';

export const RESOURCE_LABELS: Record<PlanResource, string> = {
  tracks: 'canciones publicadas',
  requests: 'solicitudes de licencia',
  playlists: 'playlists',
  collaborators: 'colaboradores',
};
