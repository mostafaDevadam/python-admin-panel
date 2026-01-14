"use client";

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import LogoutButton from '../_buttons/LogoutButton'
import { useAuth } from '@/app/_hooks/useAuth';
import { useRolePermissions } from '@/app/_hooks/useRolePermissions';
import Notifications from '../_notifications/Notification';
import { USER_ROLE_PERMISSIONS_TYPE } from '@/app/_types/types';
import IconNotifications from '../_icons/IconNotifications';
import { useSocket } from '@/app/_hooks/useSocket';
import Notification from '../_notifications/Notification';

type Props = {
  session: any
  isAuth: boolean
  // user: USER_ROLE_PERMISSIONS_TYPE
}
const Navbar = ({ session, isAuth, }: Props) => {
  console.log("session:", session, isAuth)
  const { isAuth: is_auth, setIsAuth } = useAuth()
  const { role_name } = useRolePermissions()
  const [showSuccess, setShowSuccess] = useState(false);
  const { socket, isConnected, notificationMsgs } = useSocket()




  useEffect(() => {

    //setIsAuth(isAuth)

    if (session) setIsAuth(true)

    console.log("is_auth:", is_auth)

  }, [is_auth, session, isAuth])






  const handleShowNotifications = () => {
    setShowSuccess(true);
  };

  const baseTop = 1; // Starting top position (rem)
  const spacing = 5; // Vertical spacing between messages (rem)


  return (
    <div className='bg-white shadow-sm'>
      <div className='container mx-auto p-4 flex justify-between items-center'>
        <Link href={'/'} className='text-xl font-bold text-blue-800'>App
        </Link>
        <div className='flex items-center space-x-4'>
          {
            is_auth ? (
              <>

                {/* Notification Button */}
                {
                  role_name === 'admin' && (
                    <button
                      onClick={handleShowNotifications}
                      className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                      aria-label="Notifications"
                    >
                      <IconNotifications />
                      {/* Optional: Badge for unread count */}
                      {( // Toggle based on unread state
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                          {notificationMsgs ? notificationMsgs.length : 3}
                        </span>
                      )}
                    </button>

                  )
                }

                {


                  notificationMsgs && notificationMsgs.map((msg, index) => (
                    <div className='absolute z-20 top-1/4 right-1' key={msg.id}>
                      <Notification
                        key={msg.id}
                        message={msg.message}
                        type="success"
                        duration={3000}
                        isVisible={showSuccess}
                        positionIndex={index}
                        onClose={() => setShowSuccess(false)}
                      />
                    </div>
                  ))
                }


                <LogoutButton />
              </>

            ) : (
              <>
                <Link href={'/login'} className='text-blue-800 hover:underline'>Login</Link>
                <Link href={'/register'} className='text-blue-800 hover:underline'>Register</Link>
              </>
            )
          }
        </div>

      </div>

    </div>
  )
}

export default Navbar