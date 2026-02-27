import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const login = async (email, password) => {
    const { data } = await axios.post("/api/auth/login", {
      email,
      password,
    });
    setUser(data.user);
    setAccessToken(data.accessToken);
  };

  const logout = async () => {
    await axios.post("/api/auth/logout");
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
