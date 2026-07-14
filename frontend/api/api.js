import axios from "axios";
// import.meta.env.VITE_API_URL ||
const baseURL = ("http://127.0.0.1:8000/api").replace(/\/$/, "");

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Axios treats `/path` as site-root, not baseURL — strip leading slashes.
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