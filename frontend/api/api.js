import axios from "axios"; 
const baseURL = (import.meta.env.VITE_API_URL ||"http://127.0.0.1:8000/api").replace(/\/$/, "");

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.url?.startsWith("/")) {
      config.url = config.url.slice(1);
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers["X-User-Token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401 Unauthorized, automatically log out
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/LoginUsers";
    }
    return Promise.reject(error);
  }
);