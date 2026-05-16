import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const setupRefreshInterceptor = (apiClient: AxiosInstance) => {
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Avoid infinite loops and only handle 401 Unauthorized
      if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh')) {
        
        if (isRefreshing) {
          return new Promise<string | null>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        try {
          // Use a separate axios instance to avoid base interceptors if needed, 
          // but here we call the endpoint directly
          const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
            refresh_token: refreshToken
          });

          const { access_token, refresh_token } = response.data;

          // Update store
          useAuthStore.getState().updateTokens(access_token, refresh_token);

          // Update header for original request and retry
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = 'Bearer ' + access_token;
          }
          
          processQueue(null, access_token);
          
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError as Error, null);
          useAuthStore.getState().logout();
          
          // Redirect to login if on client side
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};
