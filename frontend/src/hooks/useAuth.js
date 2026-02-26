import { useAuth } from "../context/AuthContext";

export const useAuthStatus = () => {
  const { isAuthenticated, loading, user } = useAuth();
  return { isAuthenticated, loading, user };
};

export const useAuthActions = () => {
  const { login, signup, loginWithGoogle, logout, error } = useAuth();
  return { login, signup, loginWithGoogle, logout, error };
};
