import { USER_ROLE_PERMISSIONS_TYPE, USER_TYPE } from "../_types/types"
import { getID } from "../../lib/id"
import { callApi, callApi2 } from "./callApi"

const prefix = "users"
const getAllUsers = async (): Promise<USER_TYPE[]> => {
    const response = await callApi2<USER_TYPE[]>(`${prefix}/`, "GET")
    console.log("getAllUsers response:", response)
    return response.data

}

const getUsersCount = async () => {
    const response = await callApi2<{count: number}>(`${prefix}/all/count`, "GET")
    console.log("getAllUsers response:", response)
    return response.data

}

const getUserById = async (userId: number): Promise<USER_ROLE_PERMISSIONS_TYPE> => {
    //const userId = await getID("user_id")
    const response = await callApi2<USER_ROLE_PERMISSIONS_TYPE>(`${prefix}/${userId}`, "GET")
    console.log("getUserById response:", response)
    return response.data
}

export const UsersApi = {
    getAllUsers,
    getUsersCount,
    getUserById,

}