import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("uniswap_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // On first load, verify the stored token is still valid and refresh
  // the cached user data.
  useEffect(() => {
    const token = localStorage.getItem("uniswap_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("uniswap_user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (token, userData) => {
    localStorage.setItem("uniswap_token", token);
    localStorage.setItem("uniswap_user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    persistSession(res.data.token, res.data.user);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await api.post("/auth/register", payload);
    persistSession(res.data.token, res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("uniswap_token");
    localStorage.removeItem("uniswap_user");
    setUser(null);
  };

  const updateCachedUser = (userData) => {
    localStorage.setItem("uniswap_user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateCachedUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
