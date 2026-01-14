import { PERMISSION_TYPE } from "../_types/types"
import { callApi, callApi2 } from "./callApi"


const prefix = "permissions"
const getAllPermissions = async (): Promise<PERMISSION_TYPE[]> => {
    const response = await callApi2<PERMISSION_TYPE[]>(`${prefix}/`, "GET")
    console.log("getAllPermissions response:", response)
    return response.data
}

const getAllPermissionsByRoleId = async (roleId: any) => {
    
}

const assignPermissionToRole = async (roleId: number, permissionId: number) => {
    console.log("assignPermissionToRole roleId:", roleId, "permissionId:", permissionId)
    const response = await callApi2(`${prefix}/assign/${permissionId}/role/${roleId}`, "POST")
    console.log("assignPermissionToRole response:", response)
    return response.data
}

const unAssignPermissionForRole = async (roleId: number) => {
     console.log("assignPermissionToRole roleId:", roleId)
    const response = await callApi2(`${prefix}/unassign/role/${roleId}`, "POST")
    console.log("unassignPermissionForRole response:", response)
    return response.data
    
}


const getPermissionsCount = async () => {
    const response = await callApi2<{count: number}>(`${prefix}/all/count`, "GET")
    console.log("getPermissionsCount response:", response)
    return response.data
}

const createPermission = async (permission: PERMISSION_TYPE) => {
    const response = await callApi2<PERMISSION_TYPE>(`${prefix}`, "POST", permission)
    console.log("createPermission response:", response)
    return response.data
}
 

export const PermissionsApi = {
    getAllPermissions,
    getAllPermissionsByRoleId,
    assignPermissionToRole,
    getPermissionsCount,
    createPermission,
    unAssignPermissionForRole,
}