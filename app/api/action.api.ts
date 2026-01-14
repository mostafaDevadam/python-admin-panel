import { ACTION_TYPE } from "../_types/types"
import { callApi, callApi2 } from "./callApi"


const prefix = "actions"
const getAllActions = async () => {
    const response = await callApi2<ACTION_TYPE[]>(`${prefix}/`, "GET")
    console.log("getAllActions response:", response)
    return response.data
}


export const ActionApi = {
    getAllActions,
    

    
}