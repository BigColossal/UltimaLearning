import { createContext, useContext, useState, useEffect } from "react";
import { getUser } from "../api/api";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userResponse = await getUser();
      setUser(userResponse.data);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    skills,
    loading,
    setSkills,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
