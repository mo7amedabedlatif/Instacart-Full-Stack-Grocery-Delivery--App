import axios, { AxiosError } from "axios";

// Extend axios config to include retry count
declare module "axios" {
  interface AxiosRequestConfig {
    __retryCount?: number;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:3000/api",
  timeout: 10000, // 10 seconds timeout
});

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryStatusCodes: [408, 429, 500, 502, 503, 504], // Timeout, Too Many Requests, Server Errors
};

// Request interceptor - Add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors with retry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;

    if (!config) {
      return Promise.reject(error);
    }

    // Initialize retry count
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    // Check if we should retry
    const shouldRetry =
      config.__retryCount < RETRY_CONFIG.maxRetries &&
      (error.code === "ECONNABORTED" || // Timeout
        error.code === "ENOTFOUND" || // Network error
        error.code === "ECONNREFUSED" || // Connection refused
        (error.response &&
          RETRY_CONFIG.retryStatusCodes.includes(error.response.status)));

    if (shouldRetry) {
      config.__retryCount++;

      // Calculate delay with exponential backoff
      const delay = RETRY_CONFIG.retryDelay * Math.pow(2, config.__retryCount - 1);

      console.warn(
        `🔄 Retrying request (${config.__retryCount}/${RETRY_CONFIG.maxRetries})...`,
        config.url,
        `(Delay: ${delay}ms)`
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return api(config);
    }

    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      // Only redirect if not already on auth pages
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        window.location.href = "/login";
      }
    }

    // Log network errors
    if (error.code === "ECONNABORTED") {
      console.error("❌ Request timeout after 10 seconds", config.url);
    } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      console.error("❌ Network error - could not reach server", config.url);
    }

    return Promise.reject(error);
  }
);

export default api;
