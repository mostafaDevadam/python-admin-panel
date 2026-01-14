"use client";
import { useChatDrawer } from '@/app/_hooks/useChatDrawer';
import { useDrawer } from '@/app/_hooks/useDrawer';
import { USER_TYPE } from '@/app/_types/types';
import React, { useEffect } from 'react'

type Props = {
    users: USER_TYPE[] | null
}
const Footer = ({ users }: Props) => {


    const { openDrawer, closeDrawer, isOpen, selectedUser, setUsers } = useDrawer();
    const { openChat, maximizeChat, minimizeChat, activeChats } = useChatDrawer();
    // Minimized chats (pills)
    const minimizedChats = activeChats.filter((chat) => chat.isMinimized);

    useEffect(() => {
        setUsers(users!!);
    }, [users]);

    const toggleListDrawer = () => {
        if (isOpen) {
            closeDrawer();
        } else {
            openDrawer();
        }
    };

    const openSelectedChat = () => {
        if (selectedUser) {
            openChat(selectedUser);
        } else {
            const defaultNewUser = {
                id: 999,
                name: 'New Conversation',
                email: 'new@chat.example.com',
                avatar: 'https://via.placeholder.com/40?text=NC',
            };
            openChat(defaultNewUser);
        }
    };

    // All active chats (pills always visible, regardless of minimized)
    const allActiveChats = activeChats;

    const toggleChatVisibility = (chatId: string) => {
        const chat = activeChats.find((c) => c.id === chatId);
        if (chat) {
            if (chat.isMinimized) {
                maximizeChat(chatId); // Restore/open
            } else {
                minimizeChat(chatId); // Minimize
            }
        }
    };

    return (
        <div className=' flex flex-row gap-3 justify-end fixed bottom-0 left-0 right-0 z-20 bg-gray-800 text-white shadow-lg'>

            <div className="fixed bottom-0 left-0 right-0 z-20 bg-gray-800 text-white text-center shadow-lg flex justify-end space-x-4 items-center relative">
                {/*<button
                    onClick={openSelectedChat}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors mb-3"
                >
                    {selectedUser ? `Chat with ${selectedUser.name}` : 'New Chat'}
                </button>*/}
                {/* Minimized Chat Pill */}
                {/* Stacked Minimized Pills */}
                <div className="flex space-x-2 justify-end mr-4 flex-wrap items-center flex-1 mb-3"> {/* justify-end + mr-4 for right alignment */}                    {allActiveChats.map((chat) => {
                    const isOpen = !chat.isMinimized;
                    return (
                        <button
                            key={chat.id}
                            onClick={() => toggleChatVisibility(chat.id)}
                            className={`px-4 py-2 rounded-md text-xs font-medium flex items-center space-x-1 transition-colors ${isOpen
                                ? 'bg-green-500 hover:bg-green-600 border border-green-400'
                                : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                        >
                            <span className='text-lg'>{chat.user.name}</span>
                            <span className="text-[20px]">{isOpen ? '↓' : '↑'}</span>
                        </button>
                    );
                })}
                </div>

            </div>




            <div className='flex justify-end px-2'>
                <button
                    onClick={toggleListDrawer}
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors mb-8"
                >
                    Chat
                </button>
            </div>

            {/* Fixed Footer with Minimized Pill */}

        </div>


    )
}

export default Footer