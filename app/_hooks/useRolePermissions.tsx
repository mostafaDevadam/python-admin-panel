"use client";

import React, { createContext, useContext, useEffect, useState } from 'react'
import { IoReturnDownForwardSharp } from 'react-icons/io5'
import { USER_ROLE_PERMISSIONS_TYPE } from '../_types/types';

type RolePermissionsContextType = {
  role_name: string,
  permissions: string[],
  read: (permission: string) => boolean,
  create: (permission: string) => boolean,
  update: (permission: string) => boolean,
  remove: (permission: string) => boolean

}

const default_context: RolePermissionsContextType = {
  role_name: "",
  permissions: [],
  read: () => false,
  create: () => false,
  update: () => false,
  remove: () => false
}
const RolePermissionsContext = createContext<RolePermissionsContextType>(default_context)

type Props = {
  children: React.ReactNode,
  user?: USER_ROLE_PERMISSIONS_TYPE | null
}

export const RolePermissionsProvider = ({ children, user }: Props) => {

  const [roleName, setRoleName] = useState<string>()
  const [permissions, setPermissions] = useState<string[]>()
  
  useEffect(() => {
    if (user) {
      console.log("user:", user)
      
      setRoleName(user.role_name!!)
      setPermissions(user.permissions_list!!)
      console.log("roleName:", roleName)
    }

  }, [user])

  const read = (permission: string) => permissions?.includes(`read:${permission}`)!!
  
  const create = (permission: string) => permissions?.includes(`create:${permission}`)!!

  const update = (permission: string) => permissions?.includes(`update:${permission}`)!!

  const remove = (permission: string) => permissions?.includes(`delete:${permission}`)!!


  const context: RolePermissionsContextType = {
    role_name: roleName!!,
    permissions: permissions!!,
    read,
    create,
    update,
    remove,

  }


  return <RolePermissionsContext.Provider value={context}>{children}</RolePermissionsContext.Provider>
}

//export const useRolePermissions = () => useContext(RolePermissionsContext)


export const useRolePermissions = () => {
  const context = useContext(RolePermissionsContext);
  if (context === undefined) {
    throw new Error('useRolePermissions must be used within an RolePermissionsProvider');
  }
  return context;
};

