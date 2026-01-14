
import AuthForm from '@/app/_components/_forms/AuthForm'
import { loginAction } from '@/app/actions/auth.actions'
import Link from 'next/link'
import React, { use } from 'react'

const LoginPage = () => {
 
  return (
    <div className='max-w-md mx-auto rounded-lg shadow-md px-2'>
      <h1 className='text-2xl font-bold mb-6'>Login</h1>
      <AuthForm action={loginAction} />
      <p className='mt-4 text-center'>Don't have an account <Link href={'/register'} className='text-blue-500 hover:underline'></Link></p>
    </div>
  )
}

export default LoginPage