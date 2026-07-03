import type { LicenseType } from '@/domains/tracks/types/tracks.types';

export enum RequestStatus {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  CANCELADA = 'cancelada',
}

export interface TrackRequest {
  id: string;
  status: RequestStatus;
  licenseType: string;
  createdAt: string;
  trackId?: string;
  track?: {
    id: string;
    title: string;
    coverUrl?: string;
    audioUrl?: string;
    authors?: Array<string | { id: string; name: string; lastName: string }>;
  };
  requester?: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  documentUrl?: string;
  unreadCount?: number;
  chat?: {
    id: string;
  };
  licensePrice?: number | null;
  licensePriceSetAt?: string | null;
  licensePaymentStatus?: 'none' | 'pending' | 'approved' | 'failed';
  licensePaymentReference?: string | null;
}

export interface PaginatedRequestsResponse {
  data: TrackRequest[];
  total: number;
}

export interface CreateRequestedTrackInput {
  trackId: string;
  licenseType: LicenseType;
}
