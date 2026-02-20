import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

API.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url;

     if ((status === 401 || status === 403) && !url?.includes("/auth/login")) {
        localStorage.clear();
        window.location.href = "/signin"; 
      }
    }
    return Promise.reject(error);
  }
);

export default API;
