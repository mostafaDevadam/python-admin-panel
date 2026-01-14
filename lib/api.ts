import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import Cookies from 'js-cookie'; // For manual access (if not HTTP-only)
import { refreshTokenAction } from "../app/actions/auth.actions";
import { isBrowser } from "../app/utils/browser";
import { getToken } from "./token";

const base_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL

const apiInstance: AxiosInstance = axios.create({
  baseURL: base_URL,
  //withCredentials: true, // ✅ Sends cookies automatically (same-origin or CORS-enabled)
  timeout: 10000,
});

// Request Interceptor: Optional manual token attachment (if not HTTP-only)
apiInstance.interceptors.request.use( async (config: AxiosRequestConfig | any) => {
  const accessToken = await getToken('access_token')!!; // Only if non-HTTP-only
  console.log("config access_token:", accessToken)
  if(!accessToken){
     console.log("ERROR config access_token:", accessToken)
  }
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  // For files: Override Content-Type if needed
  if (config.headers['Content-Type'] === undefined) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Response Interceptor: Handle 401 (e.g., refresh via server action)
apiInstance.interceptors.response.use(r=>r, async err => {
  if (err.response?.status === 401) {
    console.log("interceptor error:", err.response.status)
    try {
      // Call server action for refresh (uses HTTP-only cookies)
      //refreshTokenAction(); // Define below
      const token = await getToken('refresh_token')
      const res = await apiInstance.post('/auth/refresh', {token: token})
      console.log("refreshToken interceptor res:", res.data.data.access)
      if(isBrowser){
        document.cookie = `access_token=${res.data.data.access}`
        document.cookie = `refresh_token=${res.data.data.refresh}`
      }
      err.config.headers.Authorization = `Bearer ${res.data.data.access}`
      
      return apiInstance(err.config)

    } catch (e: any) {
      // Redirect to login
      console.log("ERROR:", e)
    }
  }
  return Promise.reject(err);
})
/*
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
        console.log("interceptor error:", error.response.status)
      try {
        // Call server action for refresh (uses HTTP-only cookies)
        const { success } = await refreshTokenAction(); // Define below
        if (success) {
          // Retry request
          const originalRequest = error.config as AxiosRequestConfig;
          return apiInstance(originalRequest);
        }else {
            console.log("ERROR refresh token:", success)
        }
      } catch (e: any) {
        // Redirect to login
        console.log("ERROR:", e)
        
      }
    }
    return Promise.reject(error);
  }
);*/

export default apiInstance;