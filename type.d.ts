interface AuthState {
  isLoggedIn: boolean;
  userName: string | null;
  userEmail?: string | null;
  userId: string | null;
}

type AuthContext = {
  isLoggedIn: Boolean;
  isLoading: Boolean;
  userName: string | null;
  userEmail?: string | null;
  userId: string | null;
  refreshAuth: () => Promise<Boolean>;
  signIn: () => Promise<Boolean>;
  signOut: () => Promise<Boolean>;
};
