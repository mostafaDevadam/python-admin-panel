"use server";

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios"
import { REFRESH_TOKEN_RESPONSE_TYPE, RESPONSE_TYPE } from "../_types/types"
import { clearTokens, deleteToken, getToken, setToken } from "../../lib/token"
import { get } from "http"
import { AuthApi } from "../api/auth.api";

const base_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:2000"






// Flag to prevent concurrent refreshes
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

// Create Axios instance with interceptors
export const createApiInstance = async (): Promise<AxiosInstance> => {
  const instance = axios.create({
    baseURL: base_URL, // Use global base_URL
    timeout: 10000,
  });

  // Request Interceptor: Attach access token dynamically
  instance.interceptors.request.use(
    async (config: AxiosRequestConfig | any) => {
      const token = await getToken('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor: Handle 401 (expired token) with refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue the request while refresh is in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await getToken('refresh_token');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Call your refresh endpoint (adjust URL)
          //const { data } = await axios.post<RESPONSE_TYPE<REFRESH_TOKEN_RESPONSE_TYPE>>(`${base_URL}/auth/refresh`, { refreshToken });

          const res = await AuthApi.refreshToken(refreshToken!!.toString())

          // Update tokens (assume response has { access_token, refresh_token })
          await setToken('access_token', res.access); // Implement setToken below
          await setToken('refresh_token', res.refresh);

          // Process queued requests
          processQueue(null, 'success');

          // Retry original request
          const retryResponse = await instance(originalRequest);
          return retryResponse;
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Clear tokens on failure
          await clearTokens()

          // Optional: Update auth state (e.g., via context)
          // If using your useAuth: setIsAuth(false);

          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login'; // Or use Next.js router
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // For other errors (e.g., 403, 500), reject as-is
      return Promise.reject(error);
    }
  );

  return instance;
};

// Process queued requests after refresh
const processQueue = (error: any, token: string | null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};


// Wait for ongoing refresh (for concurrent requests)
function waitForRefresh(): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (!isRefreshing) resolve();
      else setTimeout(check, 100);
    };
    check();
  });
}
