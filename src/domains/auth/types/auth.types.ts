export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'composer' | 'performer';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}
