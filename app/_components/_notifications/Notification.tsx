"use client";
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';  // For client-side cookie access
import { useSocket } from '@/app/_hooks/useSocket';


const Notification = ({
  message = 'Default message',
  type = 'info', // 'success', 'error', 'warning', 'info'
  duration = 10000, // ms
  isVisible = false,
  positionIndex = 5,
  autoClose = false,
  onClose = () => { } // Callback when closed
}) => {
  const [visible, setVisible] = useState(isVisible);
  const { socket, isConnected } = useSocket()

  const topPosition = `top-[${1 + positionIndex * 15.5}rem] right-4 z-50`;
  const baseTop = 1; // Starting top position (rem)
  const spacing = 5; // Vertical spacing between messages (rem)


  useEffect(() => {
    setVisible(isVisible);
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Delay for animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose, autoClose]);

  // Color variants based on type
  const getVariantClasses = () => {
    switch (type) {
      case 'success':
        return 'text-green-500 bg-green-100 border-green-500 dark:bg-green-800 dark:text-green-300';
      case 'error':
        return 'text-red-500 bg-red-100 border-red-500 dark:bg-red-800 dark:text-red-300';
      case 'warning':
        return 'text-yellow-500 bg-yellow-100 border-yellow-500 dark:bg-yellow-800 dark:text-yellow-300';
      default: // info
        return 'text-blue-500 bg-blue-100 border-blue-500 dark:bg-blue-800 dark:text-blue-300';
    }
  };

  const iconSvg = (
    <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
    </svg>
  );

  const closeSvg = (
    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
    </svg>
  );

  if (!visible) return null;

  return (
    <div
      className={`fixed flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow-lg border dark:bg-gray-800 dark:border-gray-600 transition-all duration-500 ease-out transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-20px] scale-95'}`} // Enhanced slide + scale
      role="alert"
      style={{
        top: `${baseTop + positionIndex * spacing}rem`,
        right: '1rem'
      }}
    >
      <div className={`inline-flex flex-shrink-0 justify-center items-center w-8 h-8 ${getVariantClasses()} rounded-lg`}>
        {iconSvg}
      </div>

      <div className="ms-3 text-sm font-normal">
        <span className="font-semibold text-gray-900 dark:text-white">Notification!</span>
        <span className="block">{message}</span>

      </div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-300 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        onClick={() => {
          setVisible(false);
          onClose();
        }}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        {closeSvg}
      </button>
    </div>
  );
};

export default Notification;