import { createContext, useContext, useState, useEffect } from "react";
import { getUser, getSkills } from "../api/api";

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

      const skillsResponse = await getSkills(userResponse.data.username);
      setSkills(skillsResponse.data);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSkills = async () => {
    try {
      const response = await getSkills(user?.username || "Jeremy");
      setSkills(response.data);
    } catch (error) {
      console.error("Error refreshing skills:", error);
    }
  };

  const value = {
    user,
    skills,
    loading,
    refreshSkills,
    setSkills,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
