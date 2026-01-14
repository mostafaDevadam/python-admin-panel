'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useChatDrawer } from './useChatDrawer';
import { USER_ROLE_PERMISSIONS_TYPE, USER_TYPE } from '../_types/types';
import { IUser } from '../_interfaces/interfaces';

interface DrawerContextType {
  openDrawer: () => void;
  closeDrawer: () => void;
  isOpen: boolean;
  onUserSelect?: (user: USER_TYPE | any) => void; // Add callback for selection (pass from page)
  selectedUser?: USER_TYPE | any;
  setUsers: (users: USER_TYPE[]) => void
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (context === undefined) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
}

interface DrawerProviderProps {
  children: ReactNode;
  onUserSelect?: (user: USER_TYPE | any) => void; // Prop to pass selection callback
  //users: USER_TYPE[] | null
}

export function DrawerProvider({ children, onUserSelect, }: DrawerProviderProps) {
  const [isOpen, setIsOpen] = useState(false); // Back to false for production; set true for demo
  const drawerRef = useRef<HTMLDivElement>(null);
  const { openChat } = useChatDrawer(); // Now works—ChatProvider is ancestor
  const [selectedUser, setSelectedUser] = useState<USER_TYPE | any | null>(null); // Move state here
  // Mock users data - Replace with API fetch in production
  const [users, setUsers] = useState<IUser[] | USER_TYPE[]>([]);




  const fake_users: IUser[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://www.gravatar.com/avatar/d4c74594d841139328695756648b6bd6?s=40&d=identicon'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'https://www.gravatar.com/avatar/9e26471d35a78862c17e467d87cddedf?s=40&d=identicon'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      avatar: 'https://www.gravatar.com/avatar/4b9bb80620f03eb3719e0a061c14283d?s=40&d=identicon'
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice@example.com',
      avatar: 'https://www.gravatar.com/avatar/c160f8cc69a4f0bf2b0362752353d060?s=40&d=identicon'
    },
    {
      id: 5,
      name: 'Charlie Wilson',
      email: 'charlie@example.com',
      avatar: 'https://www.gravatar.com/avatar/426b189df1e2f359efe6ee90f2d2030f?s=40&d=identicon'
    },
    {
      id: 6,
      name: 'Diana Davis',
      email: 'diana@example.com',
      avatar: 'https://www.gravatar.com/avatar/74d1b994efb57504441179668789472c?s=40&d=identicon'
    },
    {
      id: 7,
      name: 'Eve Garcia',
      email: 'eve@example.com',
      avatar: 'https://www.gravatar.com/avatar/e089b1dea78f4691fbb9da701cf143db?s=40&d=identicon'
    },
    {
      id: 8,
      name: 'Frank Miller',
      email: 'frank@example.com',
      avatar: 'https://www.gravatar.com/avatar/0201e09438aed04bd5e3cdc25dd5289d?s=40&d=identicon'
    },
    {
      id: 9,
      name: 'Grace Lee',
      email: 'grace@example.com',
      avatar: 'https://www.gravatar.com/avatar/9f528ceb410182ebd9d490172948f11f?s=40&d=identicon'
    },
    {
      id: 10,
      name: 'Henry Taylor',
      email: 'henry@example.com',
      avatar: 'https://www.gravatar.com/avatar/061eceeba5400fc3bb23fa3106825a36?s=40&d=identicon'
    },
  ];

  useEffect(() => {
    if (isOpen && users) {
      const list: IUser[] = users.map((m) => {
        return {
          id: m.id,
          name: m.name,
          email: m.email,
          avatar: "https://www.gravatar.com/avatar/d4c74594d841139328695756648b6bd6?s=40&d=identicon",
        } as IUser
      })

      if(list.length === 0) {
        setUsers(fake_users)
      }else {
        setUsers(list)
        console.log("list of users:", list)
      }

      
      
    }


    
  }, [isOpen, users])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      // document.addEventListener('mousedown', handleClickOutside);
      // return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  const handleUserClick = (user: USER_TYPE | any) => {
    onUserSelect?.(user); // Call parent's selection handler (sets state in page)
    setSelectedUser(user);
    openChat(user); // Opens chat drawer
  };



  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, isOpen, selectedUser, setUsers }}>
      {children}
      {/* Right-Side Drawer - Full Screen Height */}
      <div
        ref={drawerRef}
        hidden={!isOpen}
        className={`absolute top-0 right-0 z-10 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ease-linear w-80 h-screen max-w-[90vw] overflow-y-auto ${isOpen ? 'translate-y-4' : 'translate-y-full'
          }`}
        role="dialog"
        aria-modal={isOpen}
        aria-hidden={!isOpen}
        aria-label="Settings drawer"
      >
        <div className="p-6 h-full flex flex-col"> {/* Inner div still uses h-full for content flex */}
          {/* Drawer header */}
          <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold">Chats</h3>
            <button
              onClick={closeDrawer}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close drawer"
            >
              &times;
            </button>
          </div>

          {/* Drawer content */}
          {/* Users List */}
          <div className="space-y-4 flex-1">
            <ul className="space-y-3">
              {users &&
                users.map((user) => (
                  <li key={user.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => handleUserClick(user)}>
                    <img
                      src={"https://www.gravatar.com/avatar/d4c74594d841139328695756648b6bd6?s=40&d=identicon"}
                      alt={`${user.name}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                      View Profile
                    </button>
                  </li>
                ))}
              {!users &&
                fake_users.map((user) => (
                  <li key={user.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => handleUserClick(user)}>
                    <img
                      src={user.avatar}
                      alt={`${user.name}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                      View Profile
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Transparent Overlay */}

    </DrawerContext.Provider>
  );
}