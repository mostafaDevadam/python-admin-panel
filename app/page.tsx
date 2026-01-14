import Image from "next/image";
import { redirect } from "next/navigation";
import { getToken } from "../lib/token";
import { UsersApi } from "./api/users.api";
import { RolesApi } from "./api/roles.api";
import { PermissionsApi } from "./api/permissions.api";
import { AuditLogsApi } from "./api/auditlogs.api";

export default async function Home() {
   const token = await getToken('access_token')
   if(!token){
        redirect('/login')
   }

   const count_users = await UsersApi.getUsersCount()
   console.log("count_users:", count_users)
   const count_roles = await RolesApi.getRolesCount()
   console.log("count_roles:", count_roles)
   const count_permissions = await PermissionsApi.getPermissionsCount()
   console.log("count_permissions:", count_permissions)
   const count_logs = await AuditLogsApi.getAuditLogsCount()
   console.log("count_logs:", count_logs)
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans dark:bg-black ">
      <div className="flex flex-col gap-5">


        <div className="flex justify-between gap-5">
          <div className="border rounded-lg bg-gray-200 px-2 py-2 h-32 w-60 flex flex-col justify-center items-center">
            <h1 className="text-center">Total Users</h1>
            <span className="bg-blue-500 rounded-lg px-4 py-1 w-20 text-center text-white mt-1">{count_users ? count_users.count: 100}</span>
          </div>
          <div className="border rounded-lg bg-gray-200 px-2 py-2 h-32 w-60 flex flex-col justify-center items-center">
            <h1 className="text-center">Total Roles</h1>
            <span className="bg-blue-500 rounded-lg px-4 py-1 w-20 text-center text-white mt-1">{count_roles ? count_roles.count: 100}</span>
          </div>
          <div className="border rounded-lg bg-gray-200 px-2 py-2 h-32 w-60 flex flex-col justify-center items-center">
            <h1 className="text-center">Total Permissions</h1>
            <span className="bg-blue-500 rounded-lg px-4 py-1 w-20 text-center text-white mt-1">{count_permissions ? count_permissions.count: 100}</span>
          </div>
          <div className="border rounded-lg bg-gray-200 px-2 py-2 h-32 w-60 flex flex-col justify-center items-center">
            <h1 className="text-center">Audit Logs</h1>
            <span className="bg-blue-500 rounded-lg px-4 py-1 w-20 text-center text-white mt-1">{count_logs ? count_logs.count: 100}</span>
          </div>
        </div>

        <div className="flex gap-5 w-full">
          <div className="border rounded-lg bg-gray-200 h-60  w-3/5">
            <div className="bg-gray-400 h-10 w-full flex justify-start items-center px-2 rounded-t-lg">
              <h1 className="text-start">Recent Activities</h1>
            </div>

          </div>
          <div className="border rounded-lg bg-gray-200 h-60 w-2/5">
            <div className="bg-gray-400 h-10 w-full flex justify-start items-center px-2 rounded-t-lg">
              <h1 className="text-start">Quik Links</h1>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
