'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { IUser } from '../_interfaces/interfaces';


interface IMessage {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
}

interface ActiveChat {
  id: string;
  user: IUser;
  messages: IMessage[];
  inputText: string;
  isMinimized: boolean;
}

interface ChatDrawerContextType {
  openChat: (user: IUser ) => void;
  closeChat: (chatId: string) => void;
  minimizeChat: (chatId: string) => void;
  maximizeChat: (chatId: string) => void;
  activeChats: ActiveChat[];
}

const ChatDrawerContext = createContext<ChatDrawerContextType | undefined>(undefined);

export function useChatDrawer() {
  const context = useContext(ChatDrawerContext);
  if (context === undefined) {
    throw new Error('useChatDrawer must be used within a ChatDrawerProvider');
  }
  return context;
}

interface ChatDrawerProviderProps {
  children: ReactNode;
}

export function ChatDrawerProvider({ children }: ChatDrawerProviderProps) {
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([]);
  const chatRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Mock initial messages for new chat
  const loadMockMessages = (): IMessage[] => [
    {
      id: '1',
      text: `Hey! How's your day going? 😊`,
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: '2',
      text: "It's going great, thanks! Working on some exciting projects.",
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
    },
  ];

  const openChat = (user:  IUser) => {
    const newChatId = `${user.id}-${Date.now()}`;
    const newChat: ActiveChat = {
      id: newChatId,
      user,
      messages: loadMockMessages(),
      inputText: '',
      isMinimized: false,
    };
    setActiveChats((prev) => [...prev, newChat]);
  };

  const closeChat = (chatId: string) => {
    setActiveChats((prev) => prev.filter((chat) => chat.id !== chatId));
    // Cleanup ref if used
    delete chatRefs.current[chatId];
  };

  const minimizeChat = (chatId: string) => {
    setActiveChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, isMinimized: true } : chat))
    );
  };

  const maximizeChat = (chatId: string) => {
    setActiveChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, isMinimized: false } : chat))
    );
  };

  const sendMessage = (chatId: string) => {
    const chatIndex = activeChats.findIndex((c) => c.id === chatId);
    if (chatIndex === -1 || !activeChats[chatIndex].inputText.trim()) return;

    const newMessage: IMessage = {
      id: Date.now().toString(),
      text: activeChats[chatIndex].inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setActiveChats((prev) => {
      const updated = [...prev];
      updated[chatIndex] = {
        ...updated[chatIndex],
        messages: [...updated[chatIndex].messages, newMessage],
        inputText: '',
      };
      return updated;
    });

    // Simulate reply
    setTimeout(() => {
      const reply: IMessage = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! I'll get back to you soon.",
        sender: 'other',
        timestamp: new Date(),
      };
      setActiveChats((prev) => {
        const updated = [...prev];
        updated[chatIndex] = {
          ...updated[chatIndex],
          messages: [...updated[chatIndex].messages, reply],
        };
        return updated;
      });
    }, 1000);
  };

  // ESC closes last chat
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape' && activeChats.length > 0) {
        closeChat(activeChats[activeChats.length - 1].id);
      }
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [activeChats]);

  return (
    <ChatDrawerContext.Provider value={{ openChat, closeChat, minimizeChat, maximizeChat, activeChats }}>
      {children}
      {/* Multi Small Chat Drawers - Flush Bottom, No Overlay on Footer */}
      {activeChats
        .filter((chat) => !chat.isMinimized)
        .map((chat, index) => (
          <div
            key={chat.id}
            style={{ right: `${index * 20}rem`}}
            className="fixed bottom-20 right-0 z-30 bg-white border border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out w-72 h-[70vh] overflow-hidden flex flex-col"
            role="dialog"
            aria-label={`Chat with ${chat.user.name}`}
          >
            {/* Header with Minimize/Close */}
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <img
                  src={chat.user.avatar}
                  alt={`${chat.user.name}'s avatar`}
                  className="w-6 h-6 rounded-full"
                />
                <h3 className="text-xs font-semibold truncate">{chat.user.name}</h3>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => minimizeChat(chat.id)}
                  className="text-gray-500 hover:text-gray-700 text-lg font-bold p-0.5"
                  aria-label="Minimize"
                >
                  −
                </button>
                <button
                  onClick={() => closeChat(chat.id)}
                  className="text-gray-500 hover:text-gray-700 text-lg font-bold"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Messages - Flex Reverse for Auto-Scroll + Padding for Footer Space */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 flex flex-col-reverse pb-16">
              {chat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mt-5 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[200px] px-2 py-1 rounded ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-xs">{message.text}</p>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input - Padding for Footer Space */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 pb-16">
              <div className="flex space-x-1">
                <textarea
                  value={chat.inputText}
                  onChange={(e) => {
                    setActiveChats((prev) =>
                      prev.map((c) => (c.id === chat.id ? { ...c, inputText: e.target.value } : c))
                    );
                  }}
                  placeholder="Type..."
                  className="flex-1 p-2 border border-gray-300 rounded text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={2}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(chat.id))}
                />
                <button
                  onClick={() => sendMessage(chat.id)}
                  disabled={!chat.inputText.trim()}
                  className="px-2 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ))}
    </ChatDrawerContext.Provider>
  );
}