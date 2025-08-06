import fs from 'fs'
import path from 'path'
import { app } from 'electron'

class AuditLogger {
  private logStream: fs.WriteStream

  constructor() {
    const logPath = path.join(app.getPath('userData'), 'audit.log')
    this.logStream = fs.createWriteStream(logPath, { flags: 'a' })
  }

  log(userId: string, action: string, details: object = {}): void {
    const timestamp = new Date().toISOString()
    const logEntry = `${timestamp} - User: ${userId}, Action: ${action}, Details: ${JSON.stringify(
      details
    )}
`
    this.logStream.write(logEntry)
  }
}

export const auditLogger = new AuditLogger()
