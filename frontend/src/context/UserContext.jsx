import React, { createContext, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) return;

    const accessToken = localStorage.getItem("token");
    // If there is no token, skip fetching user and stop loading.
    // If there is a token, attempt to fetch the profile so `user` is populated
    // and components such as `ProfileInfoCard` can render.
    if (!accessToken) {
      setLoading(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        setUser(response.data);
      } catch (error) {
        // Don't spam the console for network issues; provide a gentle info log
        // Common causes: backend not running or network/DNS errors.
        if (
          error.code === "ECONNABORTED" ||
          error.message?.includes("timeout") ||
          error.name === "AxiosError"
        ) {
          console.info(
            "Profile fetch aborted or timed out — backend may be unreachable."
          );
        } else {
          console.info("User not authenticated");
        }
        // Ensure we clear any stale token locally
        clearUser();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("token", userData.token);
    setLoading(false);
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, loading, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
