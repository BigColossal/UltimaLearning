import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved auth on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("accessToken");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    }

    setLoading(false);
  }, []);

  // AuthContext.jsx
  const login = async (email, password) => {
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });

      setUser(data.user);
      setAccessToken(data.accessToken);

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("accessToken", data.accessToken);

      axios.defaults.headers.common["Authorization"] =
        `Bearer ${data.accessToken}`;

      return data; // ✅ return here as well
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const { data } = await axios.post("/api/auth/register", {
        username,
        email,
        password,
      });

      setUser(data.user);
      setAccessToken(data.accessToken);

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("accessToken", data.accessToken);

      axios.defaults.headers.common["Authorization"] =
        `Bearer ${data.accessToken}`;

      return data; // ✅ THIS LINE IS CRUCIAL
    } catch (error) {
      console.error("Register failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.warn("Logout request failed, clearing client anyway.");
    }

    setUser(null);
    setAccessToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");

    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
