import { UserRole } from "@/domains/users/types/users.types";
import { MenuRoute } from "../types/api.types";

export const ALL_ROLES = Object.values(UserRole);

export const tabsByRoles: MenuRoute[] = [
  {
    title: "Inicio",
    icon: "home-outline",
    name: "index",
    rolAccess: ALL_ROLES,
  },
  {
    title: "Buscar",
    icon: "cloud-search",
    name: "search",
    rolAccess: [UserRole.CANTAUTOR, UserRole.INTERPRETE, UserRole.INVITADO],
  },
  {
    title: "Mi Música",
    icon: "playlist-music",
    name: "my-music",
    rolAccess: [UserRole.CANTAUTOR, UserRole.INTERPRETE, UserRole.INVITADO],
  },
  {
    title: "Solicitudes",
    icon: "format-list-checks",
    name: "request",
    rolAccess: [UserRole.AUTOR, UserRole.EDITOR, UserRole.CANTAUTOR, UserRole.INTERPRETE],
  },
  {
    title: "Publicar",
    icon: "music-note-plus",
    name: "publish",
    rolAccess: [UserRole.AUTOR, UserRole.CANTAUTOR],
  },
  {
    title: "Chat",
    icon: "chat-processing",
    name: "chat",
    rolAccess: ALL_ROLES,
  },
  {
    title: "Más",
    icon: "plus-box",
    name: "more",
    rolAccess: [UserRole.AUTOR, UserRole.CANTAUTOR],
  },
];
