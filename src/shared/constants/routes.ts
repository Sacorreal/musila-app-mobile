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
    name: "search/index",
    rolAccess: [UserRole.CANTAUTOR, UserRole.INTERPRETE, UserRole.INVITADO],
  },
  {
    title: "Mi Música",
    icon: "playlist-music",
    name: "my-music",
    rolAccess: ALL_ROLES,
  },
  {
    title: "Solicitudes",
    icon: "format-list-checks",
    name: "request/index",
    rolAccess: [UserRole.AUTOR, UserRole.EDITOR],
  },
  {
    title: "Publicar",
    icon: "music-note-plus",
    name: "publish/index",
    rolAccess: [UserRole.AUTOR, UserRole.CANTAUTOR],
  },
  {
    title: "Chat",
    icon: "chat-processing",
    name: "chat/index",
    rolAccess: ALL_ROLES,
  },

  {
    title: "Más",
    icon: "plus-box",
    name: "more/index",
    rolAccess: [UserRole.AUTOR, UserRole.CANTAUTOR],
  },
];
