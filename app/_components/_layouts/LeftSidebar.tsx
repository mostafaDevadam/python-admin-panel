"use client";


import { useRolePermissions } from '@/app/_hooks/useRolePermissions';
import Link from 'next/link';
import React from 'react'

const LeftSidebar = () => {
    const { role_name, permissions, read } = useRolePermissions()

  return (
    <div className='flex flex-col gap-2 border rounded-lg shdaow-md *:cursor-pointer w-52 mx-auto'>
      {
        read("dashboard") && <Link href={'/'} className='mt-3 hover:bg-sky-400 hover:text-white py-2 px-4 rounded-md'>Dashboard</Link>
      }
      
      {
        read("photos") && <Link href={'/photos'} className='mt-3 hover:bg-sky-400 hover:text-white py-2 px-4 rounded-md'>Photos</Link>
      }
      {
        read("roles") && read("permissions") && <Link href={'/roles_perms'} className='mt-3 hover:bg-sky-400 hover:text-white py-2 px-4 rounded-md'>Roles & Permissions</Link>
      }
      {
        read("users") && <Link href={'/users'} className='mt-3 hover:bg-sky-400 hover:text-white py-2 px-4 rounded-md'>Users</Link>
      }
      {
        read("audit_logs") && <Link href={'/logs'} className='mt-3 hover:bg-sky-400 hover:text-white py-2 px-4 rounded-md'>AuditLogs</Link>
      }
      

    </div>
  )
}

export default LeftSidebar