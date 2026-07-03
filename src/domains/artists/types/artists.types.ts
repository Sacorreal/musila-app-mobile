import { UserRole } from '@/domains/users/types/users.types';
import type { TracksResponseDto } from '@/domains/tracks/types/tracks.types';

export interface ArtistDto {
  id: string;
  name: string;
  secondName?: string | null;
  lastName: string;
  secondLastName?: string | null;
  email: string;
  role: UserRole;
  avatar?: string | null;
  biography?: string | null;
  isVerified: boolean;
  isUserFree: boolean;
  createdAt: string;
  updatedAt: string;
  tracks?: TracksResponseDto[];
}
