import { UserRole } from '@/domains/users/types/users.types';

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.AUTOR]: 'Autor',
  [UserRole.CANTAUTOR]: 'Cantautor',
  [UserRole.INTERPRETE]: 'Intérprete',
  [UserRole.INVITADO]: 'Invitado',
  [UserRole.EDITOR]: 'Editor',
};
