export type KeyValue = {
  key: string;
  value: any;  // Or specify a type, e.g., string | number
}

export type RESPONSE_TYPE<T> = {
    status_code: number,
    message: string,
    data: T,
}

export type REFRESH_TOKEN_RESPONSE_TYPE = {
    access: string
    refresh: string
}

export type SERVER_ACTION_PAYLOAD_TYPE<T> = {
    success?: boolean,
    error?: string,
    data?: T | any

}

export type USER_ROLE_PERMISSIONS_TYPE = {
    user_id?: number
        user_name?: string
        user_email?: string
        has_role?: boolean
        has_permissions?: boolean
        role_id?: number
        role_name?: string
        permission_name?: string| any[] | null
        permissions?: string| any[] | null
        permissions_list?: string[] | any[] | null
}

export type LOGIN_RESPONSE = {
    access?: string
    refresh?: string
    user: USER_ROLE_PERMISSIONS_TYPE
}
export type USER_TYPE = {
    id?: number,
    name?: string,
    email?: string,
    role_id?: number
    role?: ROLE_TYPE | any | null
    is_active?: boolean,
    


} 



export type ACTION_TYPE = {
    id?: number,
    name?: string
}

export type ROLE_TYPE = { 
    id?: number,
    name?: string
    role_id?: number 
    role_name?: string
    permissions?: string 
    permissions_list?: string[]
    has_user?: boolean
    has_permissions?: boolean
    user?: USER_TYPE

}

export type PERMISSION_TYPE = { 
    id?: number,
    name?: string
    resource?: string
    description?: string
    action_id?: number
    action?: ACTION_TYPE | any | null
    roles?: any[]
    role?: ROLE_TYPE
    has_role?: boolean

}

export type PHOTO_TYPE = { 
    id?: number,
    url?: string

}

export type AUDIT_LOG_TYPE = { 
    id?: number,
    action?: string,
    ip?: string
    created_at?: string
    user_agent?: string
    user_id?: number
    user?: USER_TYPE | any | null

}
