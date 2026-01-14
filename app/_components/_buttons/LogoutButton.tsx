"use client";

import { logoutAction } from '@/app/actions/auth.actions';
import React from 'react'
import { toast } from 'react-toastify'

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      await logoutAction()
      toast("Logout successful")
    } catch (error) {
      console.log("Failed to logout:", error);
      toast("Logout failed")
    }

  }
  return (
    <button onClick={handleLogout} className='bg-read-500 hover:bg-read-700 font-bold py-2 px-4 rounded-md cursor-pointer'>Logout</button>
  )
}

export default LogoutButton