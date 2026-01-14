"use client";
import React, { useActionState } from 'react'

type Props = {
 action: (prevState: any, formData: FormData) => Promise<any>
}
const RoleForm = ({action}: Props) => {
    const [state, formAction] = useActionState(action, null)
  return (
    <form action={formAction} className='flex flex-col gap-3'>
        <div className='flex flex-col gap-2'>
            <label>Role Name</label>
            <input type='text' name="name" className='border rounded-lg py-2 px-2' />
        </div>
        <div className='flex justify-end'>
            <button type='submit' className='bg-blue-500 text-white px-2 py-2 rounded-lg'>Submit</button>
        </div>
    </form>
  )
}

export default RoleForm