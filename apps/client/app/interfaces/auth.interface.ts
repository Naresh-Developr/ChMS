export interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpFormData {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export type UserRole = "user" | "admin" | "superAdmin";
