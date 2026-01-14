
import { cookies } from "next/headers"

// Set 
export const setID = async (key: string, id: string) => {
    const cookieStore = await cookies()
    const idCookie = cookieStore.set(key, id, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 * 24 * 7, path: '/' })
}

// Get
export const getID = async (key: string) => {
    const session = (await cookies()).get(key)?.value;
    console.log("session:", session)
    if (!session) return null;
    return session; //JSON.parse(session?.toString() || '')

}

// Delete
export const deleteID = async (key: string) => {
    (await cookies()).delete(key)
}