import { AuditLogsApi } from '@/app/api/auditlogs.api'
import { UsersApi } from '@/app/api/users.api'
import React from 'react'

export async function generateStaticParams({ params }: any) {

    console.log("generateStaticParams params:", params)

   return [{
    slug: "slug",
  }]
}




const UserDetailsPage = async ({ params }: { params: Promise<{ id: string, slug: string  }> }) => {
    console.log("params slug:", (await params).slug)
    const { id } = await params
    console.log("UserDetailsPage userId:", id)

    const user_audit_logs = await AuditLogsApi.getAllAuditLogsByUserId(id!!)
    console.log("user_audit_logs:", user_audit_logs)

    const user = await UsersApi.getUserById(parseInt(id!!))
    console.log("user:", user)

    return (
        <div>UserDetailsPage</div>
    )
}

export default UserDetailsPage