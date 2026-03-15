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

export type UserRole = "user" | "admin" | "superAdmin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
