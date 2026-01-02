import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/* =======================
   REQUEST INTERCEPTOR
======================= */
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = token; // tanpa Bearer
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/* =======================
   RESPONSE INTERCEPTOR
======================= */
API.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        localStorage.clear();
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  }
);

export default API;
