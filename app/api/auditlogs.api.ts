import { AUDIT_LOG_TYPE } from "../_types/types"
import { callApi, callApi2 } from "./callApi"


const prefix = "audits"
const getAllAuditLogs = async (): Promise<AUDIT_LOG_TYPE[]> => {
        const response = await callApi2<AUDIT_LOG_TYPE[]>(`${prefix}/`, "GET")
        console.log("getAllActions response:", response)
        return response.data

}

const getAllAuditLogsByUserId = async (userId: any): Promise<AUDIT_LOG_TYPE[]> => {
    const response = await callApi2<AUDIT_LOG_TYPE[]>(`${prefix}/all/user/${userId}`, "GET")
    console.log("getAllActions response:", response)
    return response.data
}

const getAuditLogsCount = async () => {
    const response = await callApi2<{count: number}>(`${prefix}/all/count`, "GET")
    console.log("getAuditLogsCount response:", response)
    return response.data
}


export const AuditLogsApi = {
    getAllAuditLogs,
    getAllAuditLogsByUserId,
    getAuditLogsCount,
    
}