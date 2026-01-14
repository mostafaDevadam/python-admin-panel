"use server";

import { deleteID, setID } from "../../lib/id"
import { clearTokens, deleteToken, getToken, setToken } from "../../lib/token"
import { LOGIN_RESPONSE, SERVER_ACTION_PAYLOAD_TYPE } from "../_types/types";
import { AuthApi } from "../api/auth.api"
import { redirect } from "next/navigation"
import { cookies } from "next/headers";
import { setCookie, deleteCookie, getCookie, getCookies, hasCookie } from 'cookies-next/server';


export const loginAction = async (preState: any, formData: FormData): Promise<SERVER_ACTION_PAYLOAD_TYPE<LOGIN_RESPONSE>> => {
    console.log("formData:", formData, formData.get("email"), formData.get("password"))
    try {
        const response = await AuthApi.login(formData.get("email") as string, formData.get("password") as string)
        if (!response || !response.access) console.log("Invalid credentials")
        await setToken("access_token", response?.access!!.toString())
        await setToken("refresh_token", response?.refresh!!.toString())
        await setID("user_id", response?.user.user_id!!.toString())
        await setID("role_id", response?.user.role_id!!.toString())



        return { success: true, data: response }

    } catch (error) {
        console.log("Failed to login:", error);

        return { error: "Failed to login" }
    }

    //redirect("/");

}

export const registerAction = async (preState: any, formData: FormData) => {

}


export async function refreshTokenAction() {
    console.log("refreshTokenAction")
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value //await getToken("refresh_token") //await getCookie("refresh_token", {cookies}) //cookieStore.get('refresh_token')?.value;
   console.log("cookie refreshToken:", refreshToken)
   
    if (!refreshToken) return { success: false };

    console.log("refreshToken:", refreshToken)

    const res = await AuthApi.refreshToken(refreshToken!!)

    /*const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Sends cookies to backend
      body: JSON.stringify({ token: refreshToken }),
    });
  
    if (!res.ok) {
      await clearTokens();
      return { success: false };
    }*/

    if (!res.access || !res.refresh) {
        await clearTokens();
        return { success: false };
    }

    console.log("refreshTokenAction res:", res)

    const { access: access_token, refresh: refresh_token } = res //await res.json();
    //await setCookie("access_token", access_token, {cookies})
    //await setCookie("refresh_token", refresh_token, {cookies})
    cookieStore.set("access_token", access_token, { 
        httpOnly: true, 
       // secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        maxAge: 60 * 60 * 24 * 7, 
        path: '/' 
    });

    cookieStore.set("refresh_token", refresh_token, { 
        httpOnly: true, 
       // secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        maxAge: 60 * 60 * 24 * 7, 
        path: '/' 
    });
    
    //cookieStore.set("access_token", access_token)
   // cookieStore.set("refresh_token", refresh_token)
    //await setToken('access_token', access_token);
    //await setToken('refresh_token', refresh_token);
    return { success: true };
}


export const logoutAction = async () => {
    await deleteToken("access_token")
    await deleteToken("refresh_token")
    await deleteID("user_id")
    await deleteID("role_id")
    redirect("/login");

}

