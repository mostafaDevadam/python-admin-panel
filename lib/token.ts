"use server";
import { cookies } from "next/headers";

// Set 
export const setToken = async (key: string, token: string) => {
    if (!key || !token) return;
    const cookieStore = await cookies();
    cookieStore.set(key, token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        maxAge: 60 * 60 * 24 * 7, 
        path: '/' 
    });
};

// Get
export const getToken = async (key: string) => {
    if (!key) return;
    const cookieStore = await cookies();
    const session = cookieStore.get(key)?.value;
    console.log("session:", session);
    if (!session) return null;
    return session; //JSON.parse(session?.toString() || '')
};

// Delete
export const deleteToken = async (key: string) => {
    if (!key) return;

    const cookieStore = await cookies();
    cookieStore.delete(key);
};

export const clearTokens = async () => {
    await deleteToken('access_token');
    await deleteToken('refresh_token');
};