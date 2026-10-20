import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

const SavedContext = createContext(null);

export function SavedProvider({ children }) {
  const { user } = useAuth();
  const [savedKeys, setSavedKeys] = useState(new Set());

  const refresh = useCallback(async () => {
    if (!user) {
      setSavedKeys(new Set());
      return;
    }
    const res = await api.get("/saved/ids");
    setSavedKeys(new Set(res.data.saved.map((s) => `${s.itemType}:${s.itemId}`)));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isSaved = (itemType, itemId) => savedKeys.has(`${itemType}:${itemId}`);

  const toggleSaved = async (itemType, itemId) => {
    const res = await api.post("/saved/toggle", { itemType, itemId });
    setSavedKeys((prev) => {
      const next = new Set(prev);
      const key = `${itemType}:${itemId}`;
      if (res.data.saved) next.add(key);
      else next.delete(key);
      return next;
    });
    return res.data.saved;
  };

  return (
    <SavedContext.Provider value={{ isSaved, toggleSaved, refresh }}>
      {children}
    </SavedContext.Provider>
  );
}

export const useSaved = () => useContext(SavedContext);
