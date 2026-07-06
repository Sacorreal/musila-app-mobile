export enum CollaboratorPermission {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
}

export interface PlaylistCollaboratorGuest {
  id: string;
  name: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  isVerified: boolean;
  role: string;
}

export interface PlaylistCollaborator {
  id: string;
  permission: CollaboratorPermission;
  createdAt: string;
  updatedAt: string;
  guest: PlaylistCollaboratorGuest;
}

export interface AddCollaboratorInput {
  guestId: string;
  permission?: CollaboratorPermission;
}

export interface AddMultipleCollaboratorsInput {
  collaborators: AddCollaboratorInput[];
}
