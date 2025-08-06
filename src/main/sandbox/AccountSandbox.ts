import { BrowserWindow } from 'electron'
import { sandboxedBrowserService } from './SandboxedBrowserService'
import { sandboxedMsgService } from './SandboxedMsgService'
import { sandboxConfig } from './SandboxConfig'
import { resourceMonitor } from '../monitoring/ResourceMonitor'
import { securityManager } from '../security/SecurityManager'
import { auditLogger } from '../security/AuditLogger'
import { MsgService } from '../service/msg.service'
import { AccountConfig, MergedConfig, Permission } from '../types/sandbox.types'

class AccountSandbox {
  public readonly userId: string
  public readonly browserWindow: BrowserWindow
  public readonly msgService: MsgService

  constructor(userId: string) {
    this.userId = userId
    this.browserWindow = sandboxedBrowserService.createBrowserWindow(userId)
    this.msgService = sandboxedMsgService.getAccountMsgService(userId)
    resourceMonitor.startMonitoring(userId)
    auditLogger.log(this.userId, 'create_sandbox')
  }

  getConfig(): MergedConfig {
    return sandboxConfig.getEffectiveConfig(this.userId)
  }

  setConfig(config: Partial<AccountConfig>): void {
    sandboxConfig.setAccountConfig(this.userId, config)
    auditLogger.log(this.userId, 'update_config', config)
  }

  checkPermission(action: Permission): boolean {
    return securityManager.checkPermission(this.userId, action)
  }

  destroy(): void {
    sandboxedBrowserService.destroyBrowserWindow(this.userId)
    resourceMonitor.stopMonitoring(this.userId)
    auditLogger.log(this.userId, 'destroy_sandbox')
  }
}

class SandboxManager {
  private sandboxes = new Map<string, AccountSandbox>()

  createSandbox(userId: string): AccountSandbox {
    const existingSandbox = this.sandboxes.get(userId)
    if (existingSandbox) {
      if (existingSandbox.browserWindow && !existingSandbox.browserWindow.isDestroyed()) {
        existingSandbox.browserWindow.show()
        existingSandbox.browserWindow.focus()
        return existingSandbox
      } else {
        // If the window is destroyed, remove the old sandbox before creating a new one.
        this.destroySandbox(userId)
      }
    }
    const newSandbox = new AccountSandbox(userId)
    this.sandboxes.set(userId, newSandbox)
    return newSandbox
  }

  getSandbox(userId: string): AccountSandbox | undefined {
    return this.sandboxes.get(userId)
  }

  destroySandbox(userId: string): void {
    const sandbox = this.sandboxes.get(userId)
    if (sandbox) {
      sandbox.destroy()
      this.sandboxes.delete(userId)
    }
  }
}

export const sandboxManager = new SandboxManager()
