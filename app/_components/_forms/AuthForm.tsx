"use client";

import { redirect } from 'next/navigation';
import React, { useActionState, useEffect } from 'react'
import { toast } from 'react-toastify';

type Props = {
    action: (prevState: any, formData: FormData) => Promise<any>

}
const AuthForm = ({action}: Props) => {
    const [state, formAction] = useActionState(action, null)
    useEffect(() => {
        if(state?.success){
            toast("login success")
            redirect("/")
        }

        if(state?.error){
            toast(state.error)
            redirect("/login")
        }
        
    }, [ state ])
  return (
    <form action={formAction} className='flex flex-col gap-2 px-2 py-2'>
        <div className='flex flex-col gap-2'>
            <label>Email</label>
            <input type='email' name="email" className='border rounded-lg py-2 px-2' />
        </div>
         <div className='flex flex-col gap-2'>
            <label>Password</label>
            <input type='password' name="password" className='border rounded-lg py-2 px-2' />
        </div>
        <div className='flex justify-end px-2 mt-5'>
            <button className='rounded-lg bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4'>Login</button>
        </div>
    </form>
  )
}

export default AuthForm