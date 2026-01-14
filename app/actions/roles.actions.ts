"use server";

import { ROLE_TYPE, SERVER_ACTION_PAYLOAD_TYPE } from "../_types/types";
import { RolesApi } from "../api/roles.api";



export const createRoleAction = async (prevState: any, formData: FormData) => {
    const name = formData.get("name")!!.toString()                
    console.log("creareRoleAction formData:", formData)
    const role: ROLE_TYPE = {
        name: name
    }

    try {
        const result = await RolesApi.createRole(role)
        return {success: true, data: result}
    }catch (error) {
        console.log("createRoleAction error:", error)
        return {error: "failed to create a new role"}
    }
}

export const assignRoleToUserAction = async (prevState: any, formData: FormData): Promise<SERVER_ACTION_PAYLOAD_TYPE<ROLE_TYPE>> => {
    console.log("assignRoleToUserAction formData:", formData)
    const userId = Number(formData.get("userId")!!.toString())
    const roleId = Number(formData.get("roleId")!!.toString())

    try {
        const result = await RolesApi.assignRoleToUser(userId!!, roleId!!)
        console.log("assignRoleToUserAction result:", result)
        return { success: true, data: ""}
    } catch (error) {
        return {error: "cannot assign role to user"}
    }

}

export const unAssignRoleToUserAction = async (prevState: any, formData: FormData): Promise<SERVER_ACTION_PAYLOAD_TYPE<ROLE_TYPE>> => { 
    console.log("unAssignRoleToUserAction formData:", formData)
    const userId = Number(formData.get("userId")!!.toString())
    const roleId = Number(formData.get("roleId")!!.toString())

    try {
        const result = await RolesApi.unAssignRoleToUser(userId!!, roleId!!)
        console.log("unAssignRoleToUserAction result:", result)
        return { success: true, data: result.data}
    } catch (error) {
        return {error: "cannot unassign role for user"}
    }

}
