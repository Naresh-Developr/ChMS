export type UserRole = "user" | "admin" | "superAdmin";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpRequest {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface SignInResponse extends User {
  accessToken: string;
}
