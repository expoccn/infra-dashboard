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

export interface AdminAccessUser {
  id: string;
  username: string;
  display_name: string;
  role: AccessRole;
  active: boolean;
  must_change_password: boolean;
  failed_login_count: number;
  locked_until: string | null;
  last_login_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminUsersResponse {
  ok: boolean;
  users: AdminAccessUser[];
}

export interface AdminCreateUserResponse {
  ok: boolean;
  message: string;
  user: AdminAccessUser;
  temporary_password: string;
  must_change_password: true;
}

export interface AdminUpdateUserResponse {
  ok: boolean;
  message: string;
  user: AdminAccessUser;
}

export interface AdminResetPasswordResponse {
  ok: boolean;
  message: string;
  user: AdminAccessUser;
  temporary_password: string;
  must_change_password: true;
}
