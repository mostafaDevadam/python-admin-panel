"use client";
import { getCookie } from "cookies-next";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from 'js-cookie';  // For client-side cookie access

// Ensures client-side only

type SOCKET_CONTEXT_TYPE = {
    socket: Socket | null,
    isConnected: boolean,
    notificationMsgs: { id: number, message: string }[],
}

const default_socket_context: SOCKET_CONTEXT_TYPE = {
    socket: null,
    isConnected: false,
    notificationMsgs: [{id: 0, message: "" }],
}
export const SocketContext = createContext<SOCKET_CONTEXT_TYPE>(default_socket_context);

type Props = {
    children: React.ReactNode
    access_token?: string
}
export const SocketProvider = ({ children, access_token }: Props) => {

    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notificationMsgs, setNotificationMsgs] = useState<{ id: number, message: string }[]>([{ id: 0, message: "" }])


    const url = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL





    useEffect(() => {
        // Initialize socket
        // const cookieValue = Cookies.get("access_token");
        // const access_token = getCookie("access_token")
        console.log("access_token:", access_token)
        const socketInstance = io(url, {
            autoConnect: true,  // Automatically connect on init
            reconnection: true,
            auth: { token: access_token },
        });

        setSocket(socketInstance);

        // Listen for connection events
        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        // Cleanup: Disconnect on unmount
        return () => {
            socketInstance.disconnect();
            setIsConnected(false);
            setSocket(null);
        };
    }, [url]);  // Re-run if URL changes


    useEffect(() => {
        if (!socket) return;

        /*socket.on('notification', (data) => {
            if (data) {
                console.log('Received notification:', data);
                setNotificationMsgs(prevMsgs => [...prevMsgs, { id: parseInt(Date.now().toString()), ...data }]);
            }
        });*/


        const handleNotification = (data: any) => {
            setNotificationMsgs((prev) => [
                ...prev,
                { id: Date.now().toString(), ...data } // Add unique ID
            ]);
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };


    }, [socket, isConnected]);

    useEffect(() => {
        console.log("notificationMsgs:", notificationMsgs)
    }, [notificationMsgs])


    const context: SOCKET_CONTEXT_TYPE = {
        socket,
        isConnected,
        notificationMsgs,
    }

    return <SocketContext.Provider value={context}>{children}</SocketContext.Provider>;

}


export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within an SocketProvider');
    }
    return context;
};

