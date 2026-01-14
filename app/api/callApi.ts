import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios"
import { REFRESH_TOKEN_RESPONSE_TYPE, RESPONSE_TYPE } from "../_types/types"
import { clearTokens, deleteToken, getToken, setToken } from "../../lib/token"
import { AuthApi } from "./auth.api"
import { get } from "http"
import { isBrowser } from "../utils/browser"
import { cookies } from "next/headers"
import apiInstance from "../../lib/api"
import axiosInstance from "@/lib/axios.helper"
//import { createApiInstance } from "../_lib/axios_help"

const base_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL 

// Custom error for auth failures
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
/*

    console.log("base_URL:", base_URL)
    let config: AxiosRequestConfig = {}

    // Create an Axios instance
    const api = axios.create({
        baseURL: base_URL,
        timeout: 10000,
    });

    // Request interceptor: Attach access token
    api.interceptors.request.use(
        async (config) => {
            const accessToken = await (await cookies()).get("access_token")
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken!!}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor: Handle 401s with refresh
    api.interceptors.response.use(
        (response) => response, // Pass through successful responses
        async (error) => {
            const originalRequest = error.config;

            // If it's a 401 and we haven't retried yet
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true; // Mark to prevent loops

                try {
                    const refreshToken = await getToken('refresh_token');
                    if (!refreshToken) {
                        throw new Error('No refresh token');
                    }

                    // Call refresh endpoint
                    //const { data } = await axios.post<RESPONSE_TYPE<REFRESH_TOKEN_RESPONSE_TYPE>>(`${base_URL}/auth/refresh`, { token: refreshToken!! });
                    const res = await AuthApi.refreshToken(refreshToken!!)
                    cookies().then(th => {
                        th.set("access_token", res.access)
                        th.set("refresh_token", res.refresh)
                    })
                    
                    // Update tokens
                     //await cookies().set("access_token", data.data.access)
                     //await cookies().set("refresh_token", data.data.refresh)
                    //await setToken('access_token', );
                    //await setToken('refresh_token', data.data.refresh);

                    const newAccessToken = res.access;



                    // Update storage


                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken!!}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed: Clear tokens and redirect to login
                    clearTokens();
                    if(isBrowser){
                       // window.location.href = '/login';
                    }
                    //throw new AuthError('Token refresh failed');
                    //throw Error('Token refresh failed');
                    return Promise.reject(refreshError);
                }
            }

            // If not a retryable 401, reject as-is
            return Promise.reject(error);
        }
    );

       */


// Helper: Set token (e.g., in cookies; adjust for localStorage if needed)
export const callApi2 = async <T = any>(
    url: string,
    method: string,
    body?: any,
    isFile: boolean = false
): Promise<RESPONSE_TYPE<T>> => {
    // Dynamic Content-Type for files
    
     const config$: AxiosRequestConfig = {
        method,
        baseURL: `${base_URL}/${url}`,
        
        data: body,
        headers: isFile
            ? { 'Content-Type': 'multipart/form-data' }
            : { 'Content-Type': 'application/json' },
    };

    try {
        const response = await axiosInstance(config$) //apiInstance(config$);
        console.log("response:", response.request?.status)
        return response.data as RESPONSE_TYPE<T>
    } catch (error: any) {
        // Handle auth errors globally if needed (e.g., update context)
        if (error instanceof Error && error?.message.includes('Token refresh failed')) {
            // Integrate with useAuth: setIsAuth(false);
            if(isBrowser){
                // window.location.href = '/login';
            }
           
        }
        throw error;
    }
};


export const callApi = async <T = any>(url: string, method: string, body?: any, isFile: boolean = false) => {
    const token = await getToken("access_token")
    const response = await axios({
        baseURL: `${base_URL}/${url}`,
        headers: {
            "Content-Type": !isFile ? "application/json" : "multipart/form-data",
            "Authorization": `Bearer ${token}` || ""
        },
        method: method,
        data: body,

    }, )



    const res: RESPONSE_TYPE<T> = response.data
    return res

}