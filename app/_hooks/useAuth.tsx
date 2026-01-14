"use client";
import React, { Context, createContext, ReactNode, use, useContext, useEffect, useState } from 'react'

// Define the shape of the user object
interface User {
  id: number;
  name: string;
  email: string;
}

// Define the full shape of the context value
interface AuthContextType {
 // user?: User | null;
 // login?: (email: string, password: string) => Promise<any>;
 // register?: (email: string, password: string) => Promise<any>;
 // logout?: () => void;
 // loading?: boolean;
  isAuth?: boolean
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>

}

const defaultAuthContext: AuthContextType = {
  //user: null,
  //login: async () => ({ success: false }),
 // logout: () => {},
 //loading: false
 isAuth: false,
 setIsAuth: (val) => false
}

// Create the typed context (defaults to null if not provided)
export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// AuthProvider component with props typing
interface AuthProviderProps {
  children: ReactNode;
}

//const AuthContext = createContext();

 export const AuthProvider : React.FC<AuthProviderProps>= ({ children }: any) => {
  const [isAuth, setIsAuth] = useState<boolean>(false)

  useEffect(() => {
         console.log("isAuth:", isAuth)
  }, [isAuth])

  const context: AuthContextType = {
    isAuth,
    setIsAuth,
  }

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

