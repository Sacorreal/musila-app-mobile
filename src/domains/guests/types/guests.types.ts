export interface GuestResponse {
  id: string;
  name: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedGuestsResponse {
  data: GuestResponse[];
  total: number;
}

export interface CreateInviteInput {
  email: string;
  guestName: string;
}

export interface InviteResponse {
  id: string;
  token: string;
  email: string | null;
  isUsed: boolean;
  expiresAt: string;
  inviteUrl: string;
  qrCode: string;
  createdAt: string;
}
