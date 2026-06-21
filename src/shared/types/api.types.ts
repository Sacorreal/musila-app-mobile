import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";
import { UserRole } from "@/domains/users/types/users.types";

export type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface MenuRoute {
  title: string;
  icon: IconName;
  name: string;
  rolAccess: UserRole[];
}
