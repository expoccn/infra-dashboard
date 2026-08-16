export type AccessRole = 'ADMIN' | 'VIEWER';

export interface AuthUser {
  id: string;
  username: string;
  display_name: string;
  role: AccessRole;
  must_change_password: boolean;
}

export interface LoginResponse {
  ok: boolean;
  access_token: string;
  expires_at: string;
  user: AuthUser;
}

export interface MeResponse {
  ok: boolean;
  expires_at: string;
  user: AuthUser;
}

export interface LogoutResponse {
  ok: boolean;
}

export interface ChangePasswordResponse {
  ok: boolean;
  reauthenticate: boolean;
  message: string;
}
