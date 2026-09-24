export interface AuthUser {
  id: string | number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  image: string;
  phone: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  authLoading: boolean;
  loginUser: (username: string, password: string) => Promise<AuthUser>;
  signInWithGoogle: () => Promise<void>;
  registerUser: (input: RegisterInput) => Promise<AuthUser>;
  updateUser: (fields: Partial<AuthUser>) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}
