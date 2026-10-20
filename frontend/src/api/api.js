import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the stored JWT (if any) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("uniswap_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token has expired/invalidated, clear it so the app falls back
// to the logged-out state instead of showing repeated failed requests.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("uniswap_token");
      localStorage.removeItem("uniswap_user");
    }
    return Promise.reject(error);
  }
);

export default api;
