import React from 'react'
import { UsersApi } from '../api/users.api'
import DataTable from '../_components/_tables/DataTable'
import { KeyValue, USER_TYPE } from '../_types/types'
import UserDataTable from '../_components/_tables/UserDataTable'


const UsersPage = async () => {
  const users = await UsersApi.getAllUsers()
  
  console.log("users:", users)

  /*
  function flattenToKeyValue<T extends Record<string, unknown>>(arr: USER_TYPE[]): KeyValue[] {
  return arr.flatMap(obj => 
    Object.entries(obj).map(([key, value]) => ({ key, value }))
  );
}

const list = flattenToKeyValue(users)

console.log("users list: ", list)


const keys = [...new Set(users.flatMap(obj => Object.keys(obj)))];  // Unique keys: ['name', 'age']
console.log("keys:", keys);
*/


  return (
    <div>
      
       <div>
          <p className='text-start text-xl '>Users Management</p>
        </div>
        <div className='mt-5 max-h-96 overflow-y-auto'>
          { users ? <UserDataTable users={users}/>  : 'No users'}
        </div>
        
      
    </div>
  )
}

export default UsersPage