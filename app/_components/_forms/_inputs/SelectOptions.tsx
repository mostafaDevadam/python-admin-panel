"use client"

import { PERMISSION_TYPE, ROLE_TYPE, USER_TYPE } from '@/app/_types/types'
import React from 'react'

type Props = {
  data: ROLE_TYPE[] | USER_TYPE[] | any[]
  tagName: string
  permission?: PERMISSION_TYPE
  
}
const SelectOptions = ({data, tagName, permission}: Props) => {
  console.log("SelectOptions data:", data, permission)


  const checkUserRole = (user: USER_TYPE) => { 
    if (!user.role && user.name){
      return <option key={user.id} value={user.id}>{user.name}</option> 
    }
  }

  const checkRolePermission = (role: ROLE_TYPE) => {
    if(!role.permissions?.includes(permission?.name!!)){
      return <option key={role.id} value={role.id}>{role.role_name}</option> 
    }
  }

  return (
    <div className='w-full'>
        <select name={tagName} className='border rounded-lg py-2 px-2 w-full' >
            <option value="0">choose</option>
            {data && data.map((item) => item.name ? checkUserRole(item) : 
            <option key={item.role_id} value={item.role_id}>{item.role_name}</option>  )}
        </select>
    </div>
  )
}

export default SelectOptions