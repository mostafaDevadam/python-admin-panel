import React from 'react'
import { ActionApi } from '../api/action.api'
import { PermissionsApi } from '../api/permissions.api'
import { RolesApi } from '../api/roles.api'
import RolesPermissionsGrid from '../_components/_grids/RolesPermissionsGrid'
import { UsersApi } from '../api/users.api'

const RolesPermsPermissionsPage = async () => {
  const actions = await ActionApi.getAllActions()
  console.log("actions:", actions)

  const permissions = await PermissionsApi.getAllPermissions()
  console.log("permissions:", permissions)

  const roles = await RolesApi.getAllRoles()
  console.log("roles:", roles)

  const users = await UsersApi.getAllUsers()

  const role_not_assigned_to_permissions = await RolesApi.getRolesNotAssigned()
  console.log("role_not_assigned_to_permissions:", role_not_assigned_to_permissions)




  return (
    <div>


      {/*<div>
        <p className='text-start text-xl '>Roles & Permissions</p>
      </div>

      <div className='mt-5 px-2 py-2 bg-gray-700 rounded-md'>
        <p className='text-start text-xl text-white'>Admin</p>
      </div>*/}


      { 
     roles && permissions ? 
     <RolesPermissionsGrid 
     users={users} 
     roles_not_assigned_to_permissions={role_not_assigned_to_permissions} 
     roles={roles} 
     permissions={permissions} 
     actions={actions} /> : 'no data'
      }



    </div>
  )
}

export default RolesPermsPermissionsPage
