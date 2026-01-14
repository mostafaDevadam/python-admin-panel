"use client";

import React, { useEffect, useRef, useState } from 'react'

const MenuFooter = () => {

   const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  return (
   <main className="p-8 min-h-screen bg-gray-50 relative"> {/* relative for absolute child positioning */}
      {/* Main content */}
      

      {/* Footer with trigger button */}
      <footer className="bg-gray-800 text-white p-4 rounded-lg text-center">
        <button
          onClick={openDrawer}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Open Settings Drawer
        </button>
      </footer>

      {/* Right-Side Drawer */}
      <div
        ref={drawerRef}
        className={`absolute top-0 right-0 z-10 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out w-80 h-full max-w-[90vw] overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Drawer header */}
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold">Settings</h3>
            <button
              onClick={closeDrawer}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              &times;
            </button>
          </div>

          {/* Drawer content */}
          <div className="space-y-4 flex-1">
            <p className="text-sm text-gray-600">Manage your preferences below.</p>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Enable notifications</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>Dark mode</span>
              </label>
            </div>
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={closeDrawer}
                className="flex-1 bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
              >
                Save
              </button>
              <button
                onClick={closeDrawer}
                className="flex-1 bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Optional: Transparent Overlay (invisible but clickable to close) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[5]" // Transparent by default—no bg classes
          onClick={closeDrawer}
        />
      )}
    </main>
  );
}

export default MenuFooter