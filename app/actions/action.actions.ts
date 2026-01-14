"use server"

import { ACTION_TYPE, SERVER_ACTION_PAYLOAD_TYPE } from "../_types/types"
import { ActionApi } from "../api/action.api"

export const getAllActionsAction = async (prevState: any, formData: FormData): Promise<SERVER_ACTION_PAYLOAD_TYPE<ACTION_TYPE[]>> => {
    try {
        const result = await ActionApi.getAllActions()
        return { success: true, data: result }
    } catch (error) {
        return { error: "Failed to get all actions" }
    }
    
}