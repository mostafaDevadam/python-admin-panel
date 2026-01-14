import { PHOTO_TYPE } from "../_types/types"
import { callApi, callApi2 } from "./callApi"


const prefix = "photos"

const getAllPhotosByUserId = async (userId: any): Promise<PHOTO_TYPE[]> => {
    const response = await callApi2<PHOTO_TYPE[]>(`${prefix}/all/user/${userId}`, "GET")
    console.log("getAllActions response:", response)
    return response.data
}


export const PhotosApi = {
    getAllPhotosByUserId,
    
}