import axios from "axios";

export const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers:{
    'Content-Type': 'application/json'
  }
})

// Add a request interceptor to attach the JWT token
// We use a custom header to avoid conflicts with Django's default SimpleJWT middleware
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['X-User-Token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);