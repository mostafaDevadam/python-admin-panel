import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Slide, ToastContainer } from "react-toastify";
import { getToken } from "../lib/token";
import Navbar from "./_components/_layouts/Navbar";
import LeftSidebar from "./_components/_layouts/LeftSidebar";
import { AuthProvider } from "./_hooks/useAuth";
import { notFound } from 'next/navigation';
import { Toaster } from "@/components/ui/sonner";
import MenuFooter from "./_components/_menu/MenuFooter";
import { DrawerProvider } from "./_hooks/useDrawer";
import Footer from "./_components/_layouts/Footer";
import { ChatDrawerProvider } from "./_hooks/useChatDrawer";
import { CookiesNextProvider } from "cookies-next";
import { getID } from "../lib/id";
import { UsersApi } from "./api/users.api";
import { RolePermissionsProvider } from "./_hooks/useRolePermissions";
import { USER_ROLE_PERMISSIONS_TYPE, USER_TYPE } from "./_types/types";
import { SocketProvider, useSocket } from "./_hooks/useSocket";

const locales = ['en', 'ar'] as const;


export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode,
  params: { locale: string },
}>) {
  const session = await getToken("access_token")
  const userId = await getID("user_id")

  console.log("userId:", userId)

  let user_role_perm: USER_ROLE_PERMISSIONS_TYPE | null = null
  let users: USER_TYPE[] | null = null

  if (session && userId) {
    user_role_perm = await UsersApi.getUserById(parseInt(userId))
    users = await UsersApi.getAllUsers()
    console.log("user_role_permissions:", user_role_perm)
  }







  return (
    <html className="">
      <body className="">
        <CookiesNextProvider pollingOptions={{ enabled: true, intervalMs: 1000 }}>
          <AuthProvider>
            <RolePermissionsProvider user={user_role_perm} >
              <ChatDrawerProvider>
                <DrawerProvider >

                  <SocketProvider access_token={session!!}>

                    <div className="min-h-screen bg-gray-50">
                      <Navbar session={session!!} isAuth={Boolean(session!!)} />
                      <div className="flex flex-row">
                        {session &&
                          <div className="container ml-auto mt-10 ms-10 w-1/4 text-center">
                            <LeftSidebar />
                          </div>}
                        <main className="container mx-auto  px-4 py-8 ">

                          {children}

                        </main>
                      </div>
                    </div>


                    <footer className="h-10">
                      {session && <Footer users={users!!} />}
                    </footer>

                  </SocketProvider>
                  <ToastContainer
                    transition={Slide}
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={true}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                    className="w-full"

                  />


                  <Toaster className="w-full" />

                </DrawerProvider>
              </ChatDrawerProvider>
            </RolePermissionsProvider>
          </AuthProvider>
        </CookiesNextProvider>
      </body>
    </html>
  );
}
