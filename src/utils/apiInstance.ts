import axios, {
    AxiosInstance,
    AxiosResponse,
} from "axios";

// Используем прокси для всех запросов к API
// Swagger показывает base URL: http://localhost:8080/api/v1
const getBaseURL = () => {
  // Если указан прокси, используем его
  if (typeof window !== "undefined") {
    return "/api/proxy";
  }
  // На сервере используем прямой URL с /api/v1
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
  // Убеждаемся, что baseUrl заканчивается на /api/v1
  return baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Добавляем токен из .env или из Redux store
axiosInstance.interceptors.request.use(
  (config) => {
    // Не добавляем токен для endpoints авторизации (login, refresh)
    const isAuthEndpoint = config.url?.includes('/login') || config.url?.includes('/refresh');

    if (!isAuthEndpoint) {
      // Приоритет: токен из .env > токен из localStorage (если нужно)
      const envToken = process.env.NEXT_PUBLIC_API_TOKEN;

      if (envToken) {
        config.headers["Authorization"] = `Bearer ${envToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      console.error(`API Error: ${error.response.status}`, error.response.data);
    } else {
      console.error("Network Error", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
