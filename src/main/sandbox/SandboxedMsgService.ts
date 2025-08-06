import { MsgFormattedPayload } from '../types'
import { XyImService } from '../service/im.service'
import { MsgService } from '../service/msg.service'

class SandboxedMsgService {
  private msgServices = new Map<string, MsgService>()

  getAccountMsgService(userId: string): MsgService {
    if (!this.msgServices.has(userId)) {
      const newMsgService = new MsgService()
      // Configure the new message service for this user
      // For example, add user-specific handlers
      this.msgServices.set(userId, newMsgService)
    }
    return this.msgServices.get(userId)!
  }

  async handleMsg(userId: string, msg: MsgFormattedPayload, wsService: XyImService) {
    const msgService = this.getAccountMsgService(userId)
    await msgService.handleMsg(msg, wsService)
  }
}

export const sandboxedMsgService = new SandboxedMsgService()
