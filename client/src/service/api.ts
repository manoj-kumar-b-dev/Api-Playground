import axios from "axios";

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    const trimmed = envUrl.trim().replace(/\/+$/, "");
    if (!trimmed.endsWith("/api")) {
      return `${trimmed}/api`;
    }
    return trimmed;
  }
  return import.meta.env.DEV ? "http://localhost:5000/api" : "/api";
};

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  Promise.reject(error)
})

//to handle global response error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      //handle logout
    }
    return Promise.reject(error);
  }
);