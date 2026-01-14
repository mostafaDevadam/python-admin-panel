// lib/axios.ts
import axios, { AxiosInstance } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import * as cookie from 'cookie';
import * as setCookieParser from 'set-cookie-parser';
import { getToken, setToken } from './token';

const base_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:2000"

const axiosInstance: AxiosInstance = axios.create({
  baseURL: base_URL,
  withCredentials: true, // Include cookies in requests
});

// Request Interceptor: Add access token to headers
axiosInstance.interceptors.request.use(
  async (config) => {
    //const accessToken = localStorage.getItem('accessToken'); // Or use your state management (e.g., Redux, Zustand)
    const accessToken = await getToken('access_token')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle refresh on 401
const refreshAuthLogic = async (failedRequest: any) => {
  // Call your Next.js API route that proxies the refresh to backend
  const refresh_token = await getToken("refresh_token")
  const refreshResponse = await axiosInstance.post('/auth/refresh', {token: refresh_token!!}); // Note: Use raw axios.post if needed to avoid loop
  console.log("refreshResponse:", refreshResponse.data)
  const { access, refresh } = refreshResponse.data.data;
  const newBearerToken = `Bearer ${access}`;

  // Update access token in storage
  //localStorage.setItem('accessToken', accessToken);
  await setToken("access_token", access!!)
  await setToken("refresh_token", refresh)
  

  // Update Axios defaults and failed request headers
  axiosInstance.defaults.headers.Authorization = newBearerToken;
  failedRequest.response.config.headers.Authorization = newBearerToken;

  // Handle new refresh token cookie if backend sets one
  if (refreshResponse.headers['set-cookie']) {
    const parsedCookies = setCookieParser.parse(refreshResponse.headers['set-cookie'], { decodeValues: true });
    const refreshCookie = parsedCookies.find((c) => c.name === 'refresh_token');
    if (refreshCookie) {
      // Update cookie for future requests (client-side)
      document.cookie = cookie.serialize(refreshCookie.name, refreshCookie.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: refreshCookie.maxAge,
        path: refreshCookie.path,
      });
    }
  }

  return Promise.resolve();
};

// Attach the auth refresh interceptor
createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic, {
  statusCodes: [401], // Trigger on these status codes
  retryInstance: axiosInstance,
});

export default axiosInstance;