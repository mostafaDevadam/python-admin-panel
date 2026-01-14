import React from 'react'
import { AuditLogsApi } from '../api/auditlogs.api'
import { getID } from '../../lib/id'
import AuditLogDataTable from '../_components/_tables/AuditLogDataTable'

const AuditLogsPage = async () => {
  const userId = await getID("user_id")
  const logs = await AuditLogsApi.getAllAuditLogs()
  console.log("audit logs:", logs)
  const user_logs = await AuditLogsApi.getAllAuditLogsByUserId(userId!!)
  console.log("user logs:", user_logs)
  return (
    <div>
      <div>
        <div>
          <p className='text-start text-xl '>Audit Logs</p>
        </div>
        <div className='max-h-96 overflow-y-auto'>
          <AuditLogDataTable logs={logs} />
        </div>
        
      </div>
    </div>
  )
}

export default AuditLogsPage