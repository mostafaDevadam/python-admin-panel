
"use server";

import { ACTION_TYPE, PERMISSION_TYPE, SERVER_ACTION_PAYLOAD_TYPE } from "../_types/types";
import { PermissionsApi } from "../api/permissions.api";


export const createPermissionAction = async (prevState: any, formData: FormData) => {
    console.log("crearePermission formData:", formData)
    //const name = formData.get("name")!!.toString()
    const resource = formData.get("resource")!!.toString()
    const description = formData.get("description")!!.toString()
    const action = formData.get("action")!!.toString()

     const perm: PERMISSION_TYPE = {
        resource: resource,
        description: description,

    }

    if (typeof action !== "string") {
        console.warn("FormData 'action' is not a string (e.g., it's a File or null)");
    }
   

    //console.log("crearePermission act:", act.split(",")[0].split(":"), act.split(",")[1].split(":"))
    perm.action_id = Number(action.split(",")[0].split(":")[1])
    perm.name = `${action.split(",")[1].split(":")[1].replace(/"/g, '').trim()}:${resource}` //remove space from string: .replace(/\s/g, '')

    console.log("crearePermission perm:", perm)

    try {
        const result = await PermissionsApi.createPermission(perm)
        console.log("PermissionsApi.createPermission result:", result)
        return { success: true, data: result }
    } catch (error) {
        return {error: "failed to created permission"}
    }
}


export const assignPermissionToRoleAction = async (prevState: any, formData: FormData): Promise<SERVER_ACTION_PAYLOAD_TYPE<PERMISSION_TYPE>> => {
    console.log("assignPermissionToRoleAction formData:", formData)
     const permissionId = formData.get("permissionId")!!.toString()
    const roleId = formData.get("roleId")!!.toString()

    console.log("assignPermissionToRoleAction permissionId:", permissionId, "roleId:", roleId)

    try {
        const result = await PermissionsApi.assignPermissionToRole(roleId as any, permissionId as any)
        console.log("assignPermissionToRoleAction result:", result)
        return { success: true, data: result.data}
    } catch (error) {
        return {error: "Cannot assign permission to role"}
    }

}

export const unAssignPermissionToRoleAction = async (prevState: any, formData: FormData): Promise<SERVER_ACTION_PAYLOAD_TYPE<PERMISSION_TYPE>> => {

     console.log("unAssignPermissionToRoleAction formData:", formData)
     const permissionId = formData.get("permissionId")!!.toString()
    const roleId = formData.get("roleId")!!.toString()

    console.log("assignPermissionToRoleAction permissionId:", permissionId, "roleId:", roleId)

    try {
        //const result = await PermissionsApi.assignPermissionToRole(roleId as any, permissionId as any)
        //console.log("assignPermissionToRoleAction result:", result)
        return { success: true, data: ""}
    } catch (error) {
        return {error: "Cannot unassign permission for role"}
    }

}
