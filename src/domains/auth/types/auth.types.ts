import { UserRole } from "@/domains/users/types/users.types";


export type AuthUser = {
  id: string
    email: string
    role: UserRole
    name: string
    plan?: 'free' | 'pro'
    secondName?: string
    lastName?: string
    secondLastName?: string
    avatarUrl?: string
    biography?: string
    phone?: string
    countryCode?: string
    typeCitizenID?: string
    citizenID?: string
};


export interface LoginPayload {
  citizenID: string;
  password: string;
}

export type AuthResponse = {
  access_token: string;
};

export type TokenPayload = {
  id: string;
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
    name: string;
    plan?: 'free' | 'pro';
};
