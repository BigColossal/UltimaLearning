import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth on mount - check for stored token
  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      // Set auth header for all requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Verify token is still valid
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      // Token invalid or expired
      Cookies.remove("authToken");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });
      const { token, user: userData } = response.data;
      Cookies.set("authToken", token, { expires: 7 });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email, password, name) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/auth/signup", {
        email,
        password,
        name,
      });
      const { token, user: userData } = response.data;
      Cookies.set("authToken", token, { expires: 7 });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Signup failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (googleToken) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/auth/google", {
        token: googleToken,
      });
      const { token, user: userData } = response.data;
      Cookies.set("authToken", token, { expires: 7 });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Google login failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    Cookies.remove("authToken");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post("/api/auth/refresh");
      const { token } = response.data;
      Cookies.set("authToken", token, { expires: 7 });
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return { success: true };
    } catch (err) {
      logout();
      return { success: false };
    }
  }, [logout]);

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    signup,
    loginWithGoogle,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
