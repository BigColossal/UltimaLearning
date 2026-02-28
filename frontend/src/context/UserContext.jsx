import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, {
  getCurrentUser,
  getSkills,
  loginUser,
  registerUser,
  setToken,
} from "../api/api";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");

      if (!token || !savedUser) {
        setLoading(false);
        return;
      }

      setToken(token);
      setUser(JSON.parse(savedUser));

      // Verify token with backend
      const userResponse = await getCurrentUser();
      setUser(userResponse.data);

      const skillsResponse = await getSkills();
      setSkills(skillsResponse.data);
    } catch (error) {
      console.error("Auth initialization failed:", error);
      logout(); // remove invalid token/user
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await loginUser({ email, password });

      if (!data?.accessToken) throw new Error(data?.message || "Login failed");

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.accessToken);
      setUser(data.user);

      const skillsResponse = await getSkills();
      setSkills(skillsResponse.data);

      // Redirect to /hub after login
      navigate("/hub");

      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Login failed";
      console.error("Login failed:", msg);
      throw new Error(msg);
    }
  };

  const register = async (username, email, password) => {
    try {
      const data = await registerUser({ username, email, password });

      if (!data?.accessToken)
        throw new Error(data?.message || "Registration failed");

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.accessToken);
      setUser(data.user);

      const skillsResponse = await getSkills();
      setSkills(skillsResponse.data);

      // Redirect to /hub after registration
      navigate("/hub");

      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Registration failed";
      console.error("Registration failed:", msg);
      throw new Error(msg);
    }
  };

  // New method: login via Google OAuth
  const loginWithGoogle = async (accessToken, userData) => {
    setToken(accessToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    setUser(userData);

    const skillsResponse = await getSkills();
    setSkills(skillsResponse.data);

    navigate("/hub");
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setSkills([]);
    api.defaults.headers.common["Authorization"] = "";
    navigate("/login");
  };

  const refreshSkills = async () => {
    if (!user) return;

    try {
      const response = await getSkills();
      setSkills(response.data);
    } catch (error) {
      console.error("Error refreshing skills:", error);
    }
  };

  const value = {
    user,
    skills,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
    refreshSkills,
    setSkills,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
