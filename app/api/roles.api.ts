import { ROLE_TYPE } from "../_types/types"
import { callApi, callApi2 } from "./callApi"


const prefix ="roles"

const getAllRoles = async () : Promise<ROLE_TYPE[]> => {
    const response = await callApi2<ROLE_TYPE[]>(`${prefix}/`, "GET")
    console.log("getAllRoles response:", response)
    return response.data

}

const assignRoleToUser = async (userId: number, roleId: number) => {
    const response = await callApi2(`${prefix}/${roleId}/assign/user/${userId}`, "PATCH")
    console.log("assignRoleToUser response:", response)
    return response
}

const unAssignRoleToUser = async (userId: number, roleId: number) => {
    const response = await callApi2(`${prefix}/${roleId}/unassign/user/${userId}`, "PATCH")
    console.log("assignRoleToUser response:", response)
    return response
}

const getRolesCount = async () => {
    const response = await callApi2<{count: number}>(`${prefix}/all/count`, "GET")
    console.log("getAllUsers response:", response)
    return response.data

}

const getRolesNotAssigned = async () => {
    const response = await callApi2<ROLE_TYPE[]>(`${prefix}/all/not/assigned`, "GET")
    console.log("getRolesNotAssigned response:", response)
    return response.data

}

const createRole = async (role: ROLE_TYPE) => {
    const response = await callApi2<ROLE_TYPE>(`${prefix}`, "POST", role)
    console.log("createRole response:", response)
    return response.data
}

export const RolesApi = {
    getAllRoles,
    assignRoleToUser,
    getRolesCount,
    createRole,
    getRolesNotAssigned,
    unAssignRoleToUser,
    
}