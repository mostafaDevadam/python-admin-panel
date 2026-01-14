"use client";

import { ACTION_TYPE, PERMISSION_TYPE, ROLE_TYPE, USER_TYPE } from '@/app/_types/types'
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import { TabsTrigger } from '@radix-ui/react-tabs'
import React, { useState } from 'react'
import RolesDataTable from '../_tables/RolesDataTable';
import PermissionsDataTable from '../_tables/PermissionsDataTable';
import { useRolePermissions } from '@/app/_hooks/useRolePermissions';
import DialogLite from '../_dialogs/DialogLite';
import RoleForm from '../_forms/RoleForm';
import PermissionsForm from '../_forms/PermissionsForm';
import { createRoleAction } from '@/app/actions/roles.actions';
import { createPermissionAction } from '@/app/actions/permissions.actions';

type Props = {
    roles: ROLE_TYPE[]
    permissions: PERMISSION_TYPE[]
     actions: ACTION_TYPE[]
     users: USER_TYPE[]
     roles_not_assigned_to_permissions?: ROLE_TYPE[]
     
}
const RolesPermissionsGrid = ({ roles, permissions, actions, users, roles_not_assigned_to_permissions }: Props) => {
    
    const [isActiveRolesTab, setIsActiveRolesTab] = useState<boolean>(false)
    const {create} = useRolePermissions()



    return (
        <div className='flex flex-col gap-5'>
            {/*<div className='w-1/3 border mb-2 pb-3'>
          <div className='bg-gray-400 px-2 py-2'>
            <p className='text-white text-start text-xl '>Roles</p>
          </div>
          <div className='flex justify-end mt-5 mb-5 px-4'>
              <button className='bg-blue-500 text-white rounded-lg px-2 py-2'>Add Role</button>
          </div>
          <div className='px-2'>
             {
            roles.map((m, index) => (
              <div key={index} className='mt-5 px-2 py-2 border rounded-md flex justify-between'>
                <p className='text-start text-xl '>{m.role_name}</p>
                <button className='border rounded-lg px-2 py-2 cursor-pointer'>Select</button>
              </div>
            ))
          }

          </div>
         
        </div>
        <div className='w-2/3 border '>
        <div className='bg-gray-400 px-2 py-2'>
            <p className='text-white text-start text-xl '>Permissions</p>
          </div>
          <div className='flex justify-end mt-5 mb-5 px-4'>
              <button className='bg-blue-500 text-white rounded-lg px-2 py-2'>Add Permission</button>
          </div>
          <div className='px-2 overflow-y-auto h-96'>
             {
            permissions.map((m, index) => (
              <div key={index} className='mt-5 px-2 py-2 border rounded-md flex gap-5'>
                <div>
                  

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="my-checkbox"
                      className="relative peer h-10 w-10 shrink-0 cursor-pointer appearance-none border-2 border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-0 transition-colors duration-200"
                    />
                    <svg
                      className="pointer-events-none absolute h-10 w-10 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                    </svg>
                    
                  </div>

                </div>
                <p className='text-start text-xl capitalize'>{m.name?.split(":").join(" ")}</p>
              </div>
            ))
          }
          </div>
         
        </div>*/}

         <div className='flex justify-end px-4 w-full'>
            {
              isActiveRolesTab ?
              ( create("roles") && (
              /*<button className='bg-blue-500 text-white rounded-lg px-2 py-2'>Add Role</button>*/
              <DialogLite buttonTitle='Add Role' dialogTitle='Create a new Role'>
                 <RoleForm action={createRoleAction} />
              </DialogLite>
            ))
              :
              ( create("permissions") && (
              /*<button className='bg-blue-500 text-white rounded-lg px-2 py-2'>Add Permission</button>*/
               <DialogLite buttonTitle='Add Permission' dialogTitle='Create a new Permission'>
                 <PermissionsForm action={createPermissionAction} actions={actions}/>
              </DialogLite>
            ))
            }
              
          </div>

          <div className=''>
              <Tabs defaultValue="roles" className="w-full">
                <TabsList className='flex gap-5 px-2 *:text-xl'>
                    <TabsTrigger value="roles" onClick={(e) => setIsActiveRolesTab(true)} className={isActiveRolesTab ? "text-red-500" : ""}>Roles</TabsTrigger>
                    <TabsTrigger value="permissions" onClick={(e) => setIsActiveRolesTab(false)} className={!isActiveRolesTab ? "text-red-500" : ""}>Permissions</TabsTrigger>
                </TabsList>
                <TabsContent value="roles">
                    <div className='w-full max-h-96 overflow-y-auto'>
                        {<RolesDataTable roles={roles} users={users} />}
                    </div>
                </TabsContent>
                <TabsContent value="permissions">
                    <div className='w-full max-h-96 overflow-y-auto'>
                      { <PermissionsDataTable roles={roles} permissions={permissions} 
                        roles_not_assigned_to_permissions={roles_not_assigned_to_permissions} />}
                    </div>
                </TabsContent>
            </Tabs>
          </div>

          

          

        </div>
    )
}

export default RolesPermissionsGrid