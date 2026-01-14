import { getToken } from "../../lib/token"
import { LOGIN_RESPONSE, REFRESH_TOKEN_RESPONSE_TYPE, USER_TYPE } from "../_types/types"
import { callApi2 } from "./callApi"

const prefix ="auth"

const login = async (email: string, password: string) => {
     const response = await callApi2<LOGIN_RESPONSE>(`${prefix}/login`, "POST", { email, password })
    console.log("login response:", response)
    return response.data

}

const register = async (email: string, password: string) => {
    const response = await callApi2(`${prefix}/register`, "POST", { email, password })
    console.log("register response:", response)
    return response

}

const refreshToken = async (token: string) => {
    //const token = await getToken("refresh_token")
     const response = await callApi2<REFRESH_TOKEN_RESPONSE_TYPE>(`${prefix}/refresh`, "POST", {token })
    console.log("refreshToken response:", response)
    return response.data

}
export const AuthApi = {
    login,
    register,
    refreshToken,

}