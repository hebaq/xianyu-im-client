import { GooFishUser, MsgFormattedPayload, MsgTypes } from '../types'
import Ws from 'ws'
import { XyApiService } from './api.service'
import xyJsModule from '../libs/xianyu_js_version_2.cjs'
import { array2cookie } from '../utils'
import { APP_KEY, USER_AGENT } from '../config'
import { clearInterval } from 'timers'
import { EventEmitter } from 'node:events'

interface ImServiceEvents {
    message: (msg: MsgFormattedPayload) => void
    error: (err: Error) => void
    connected:()=>void
}

export class XyImService {
    private token: string = ''
    user: GooFishUser
    private deviceId: string
    ws: Ws | null = null
    private cookieStr: string
    private apiService: XyApiService
    private timerId: NodeJS.Timeout | undefined = undefined
    private emitter = new EventEmitter()
    private reconnectAttempts: number = 0
    private maxReconnectAttempts: number = 5
    private reconnectDelay: number = 5000 // 5秒
    private isReconnecting: boolean = false
    private lastHeartbeatTime: number = 0
    private heartbeatCheckTimer: NodeJS.Timeout | undefined = undefined
    constructor(user: GooFishUser) {
        this.user = user
        this.cookieStr = array2cookie(user.cookies)
        this.deviceId = xyJsModule.generate_device_id(user.userId)
        this.apiService = new XyApiService(this.cookieStr, this.deviceId)
    }

    on<T extends keyof ImServiceEvents>(event: T, listener: ImServiceEvents[T]) {
        this.emitter.on(event, listener)
    }

    emit<T extends keyof ImServiceEvents>(event: T, ...args: Parameters<ImServiceEvents[T]>) {
        this.emitter.emit(event, ...args)
    }

    get status() {
        return !this.ws ? Ws.CLOSED : this.ws.readyState
    }

    // 初始化
    async init() {
        const { accessToken } = await this.apiService.getToken()
        this.token = accessToken
        this.connect()
    }
    private async connect() {
        const headers = {
            Cookie: this.cookieStr,
            Host: 'wss-goofish.dingtalk.com',
            Connection: 'Upgrade',
            Pragma: 'no-cache',
            'Cache-Control': 'no-cache',
            'User-Agent': USER_AGENT,
            Origin: 'https://www.goofish.com',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'zh-CN,zh;q=0.9'
        }
        this.ws = new Ws(`wss://wss-goofish.dingtalk.com/`, { headers })
        this.ws.on('open', () => {
            console.log(`[User:${this.user.userId}] WebSocket Connected`)
            this.reconnectAttempts = 0
            this.isReconnecting = false
            this.lastHeartbeatTime = Date.now()
            
            this.sendInitMsg()
            this.sendSyncMsg()
            this.keepHeartBeat()
            this.startHeartbeatCheck()
            
            this.emit('connected')
        })
        this.ws.on('message', async (msg) => {
            try {
                // 收到任何消息都更新心跳时间
                this.lastHeartbeatTime = Date.now()
                
                const message = JSON.parse(msg.toString())

                if (message.headers?.mid) {
                    const ack = {
                        code: 200,
                        headers: {
                            mid: message.headers.mid,
                            sid: message.headers.sid || ''
                        }
                    }
                    this.ws!.send(JSON.stringify(ack))
                }
                // 只记录重要消息，避免spam
                if (message.lwp && message.lwp !== '/!' && message.lwp !== '/s/sync') {
                    console.log(`[User:${this.user.userId}] Business Message Received`)
                }
                
                // 处理业务消息
                if (message.lwp && message.lwp === '/s/sync' && message.body?.syncPushPackage) {
                    const encryptedData = message.body.syncPushPackage.data[0].data
                    const decrypted = xyJsModule.decrypt(encryptedData)
                    const msg = JSON.parse(decrypted)
                    if (Object.keys(msg).length !== 2) return
                    const senderName = msg['1']['10']['reminderTitle']
                    const senderUserId = msg['1']['10']['senderUserId']
                    const content = msg['1']['10']['reminderContent']
                    const cid = msg['1']['2'].split('@')[0]
                    const msgInfoStr = msg['1']['6']['3']['5']
                    const extJson = JSON.parse(msg['1']['10']['extJson'] || '{}')
                    const msgInfo = JSON.parse(msgInfoStr)
                    const formattedMsg: MsgFormattedPayload = {
                        senderName,
                        senderUserId,
                        content,
                        images: [],
                        type: MsgTypes.TEXT,
                        cid:cid,
                        pnm: msg['1']['3'] || '',
                        messageId:extJson?.messageId || ''
                    }
                    if (msgInfo.contentType == 2 && msgInfo.image) {
                        formattedMsg.type = MsgTypes.IMAGE
                        const pics = msgInfo.image.pics
                        const newPics: string[] = []
                        for (let pic of pics) {
                            newPics.push(pic.url + '_570x10000Q90.jpg_.webp')
                        }
                        formattedMsg.images = newPics
                    }
                    // 简洁的消息日志
                    const messagePreview = formattedMsg.content.length > 20 
                        ? formattedMsg.content.substring(0, 20) + '...' 
                        : formattedMsg.content
                    
                    if (formattedMsg.type === 'image') {
                        console.log(`[User:${this.user.userId}] 📷 ${formattedMsg.senderName}: [Image]`)
                    } else {
                        console.log(`[User:${this.user.userId}] 💬 ${formattedMsg.senderName}: ${messagePreview}`)
                    }
                    // message handler
                    // msgService.handleMsg(formattedMsg, this.ws!)
                    this.emit('message', formattedMsg)
                }
            } catch (err) {
                // 只记录非预期的错误
                if (!(err instanceof SyntaxError)) {
                    console.error(`[User:${this.user.userId}] Message Processing Error:`, err)
                }
            }
        })

        // 添加错误处理
        this.ws.on('error', (error) => {
            console.error(`[User:${this.user.userId}] WebSocket Error:`, error.message)
            this.emit('error', error)
        })

        // 添加关闭事件处理
        this.ws.on('close', (code, reason) => {
            console.warn(`[User:${this.user.userId}] Connection Closed - Code: ${code}`)
            this.clearTimers()
            
            // 如果不是主动关闭，尝试重连
            if (code !== 1000 && !this.isReconnecting) {
                this.scheduleReconnect()
            }
        })

        // 添加意外断开检测
        this.ws.on('unexpected-response', (request, response) => {
            console.error(`[User:${this.user.userId}] Connection Error:`, response.statusCode)
        })
    }

    private keepHeartBeat() {
        this.clearTimers() // 清除之前的定时器
        
        this.timerId = setInterval(() => {
            if (!this.ws || this.ws.readyState !== Ws.OPEN) {
                console.warn(`[User:${this.user.userId}] Connection Failed, Stop Heartbeat`)
                this.clearTimers()
                return
            }

            try {
                const heartbeatMsg = {
                    lwp: '/!',
                    headers: { mid: xyJsModule.generate_mid() }
                }
                this.ws.send(JSON.stringify(heartbeatMsg))
                this.lastHeartbeatTime = Date.now()
                // 移除频繁的心跳日志
            } catch (error) {
                console.error(`[User:${this.user.userId}] Heartbeat Failed:`, error)
                this.clearTimers()
                this.scheduleReconnect()
            }
        }, 15000)
    }

    private startHeartbeatCheck() {
        this.heartbeatCheckTimer = setInterval(() => {
            const now = Date.now()
            const timeSinceLastHeartbeat = now - this.lastHeartbeatTime
            
            // 如果超过30秒没有心跳，认为连接可能有问题
            if (timeSinceLastHeartbeat > 30000) {
                console.warn(`[User:${this.user.userId}] Heartbeat Timeout, Reconnecting...`)
                this.clearTimers()
                this.scheduleReconnect()
            }
        }, 10000) // 每10秒检查一次
    }

    private clearTimers() {
        if (this.timerId) {
            clearInterval(this.timerId)
            this.timerId = undefined
        }
        if (this.heartbeatCheckTimer) {
            clearInterval(this.heartbeatCheckTimer)
            this.heartbeatCheckTimer = undefined
        }
    }

    private scheduleReconnect() {
        if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error(`[User:${this.user.userId}] Reconnect Failed, Max Attempts Reached`)
                this.emit('error', new Error('Reconnect Failed'))
            }
            return
        }

        this.isReconnecting = true
        this.reconnectAttempts++
        
        console.log(`[User:${this.user.userId}] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        
        setTimeout(async () => {
            try {
                await this.reconnect()
            } catch (error) {
                console.error(`[User:${this.user.userId}] Reconnect Failed:`, error)
                this.isReconnecting = false
                
                // 继续尝试重连
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect()
                }
            }
        }, this.reconnectDelay * this.reconnectAttempts) // 递增延迟
    }

    private async reconnect() {
        // 关闭现有连接
        if (this.ws) {
            this.ws.removeAllListeners()
            if (this.ws.readyState === Ws.OPEN || this.ws.readyState === Ws.CONNECTING) {
                this.ws.close()
            }
            this.ws = null
        }

        // 重新获取token并连接
        try {
            const { accessToken } = await this.apiService.getToken()
            this.token = accessToken
            await this.connect()
        } catch (error) {
            throw new Error(`Reconnect Error: ${error}`)
        }
    }

    private createMsgPayload(lwp: string, body?: any) {
        const msg = {
            lwp,
            headers: {
                'app-key': APP_KEY,
                token: this.token,
                ua: USER_AGENT,
                dt: 'j',
                wv: 'im:3,au:3,sy:6',
                did: this.deviceId,
                mid: xyJsModule.generate_mid(),
                sync: '0,0;0;0;',
                'cache-header': 'app-key token ua wv'
            },
            body: body
        }
        return JSON.stringify(msg)
    }

    private sendInitMsg() {
        this.ws?.send(this.createMsgPayload('/reg'))
        setTimeout(() => {
            // 2秒后再发一条消息
            this.ws?.send(
                this.createMsgPayload('/r/SyncStatus/ackDiff', [
                    {
                        pipeline: 'sync',
                        tooLong2Tag: 'PNM,1',
                        channel: 'sync',
                        topic: 'sync',
                        highPts: 0,
                        pts: Date.now() * 1000,
                        seq: 0,
                        timestamp: Date.now()
                    }
                ])
            )
        }, 2 * 1000)
    }

    private sendSyncMsg() {
        const syncMsg = {
            lwp: '/r/SyncStatus/getState',
            headers: { mid: xyJsModule.generate_mid() },
            body: [
                {
                    topic: 'sync'
                }
            ]
        }
        this.ws?.send(JSON.stringify(syncMsg))
    }

    readMsg(msg:MsgFormattedPayload){
        this?.ws?.send(this.createMsgPayload('/r/MessageStatus/read',[[msg.pnm]]))
    }

    // 断开连接的公共方法
    disconnect() {
        console.log(`[User:${this.user.userId}] Disconnecting`)
        this.clearTimers()
        
        if (this.ws) {
            this.ws.removeAllListeners()
            if (this.ws.readyState === Ws.OPEN || this.ws.readyState === Ws.CONNECTING) {
                this.ws.close(1000, 'disconnect') // 1000表示正常关闭
            }
            this.ws = null
        }
    }

    // 获取连接状态
    getConnectionStatus(): 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' {
        if (!this.ws) return 'CLOSED'
        
        switch (this.ws.readyState) {
            case Ws.CONNECTING: return 'CONNECTING'
            case Ws.OPEN: return 'OPEN'
            case Ws.CLOSING: return 'CLOSING'
            case Ws.CLOSED: return 'CLOSED'
            default: return 'CLOSED'
        }
    }

    // 发送自定义回复的消息
    sendReplyMsg(msg:MsgFormattedPayload,text:string){
        return this.sendReplyMsgExec(msg.senderUserId,msg.cid,text)
    }
    private sendReplyMsgExec(toid: string, cid:string, text: string) {
        try {
            // 构建文本内容
            const textContent = {
                contentType: 1,
                text: {
                    text: text
                }
            }

            // 转换为 Base64
            const textStr = JSON.stringify(textContent)
            const textBase64 = Buffer.from(textStr).toString('base64')

            // 构建消息体
            const msg = this.createMsgPayload('/r/MessageSend/sendByReceiverScope', [
                {
                    uuid: xyJsModule.generate_uuid(),
                    cid: `${cid}@goofish`,
                    conversationType: 1,
                    content: {
                        contentType: 101,
                        custom: {
                            type: 1,
                            data: textBase64
                        }
                    },
                    redPointPolicy: 0,
                    extension: {
                        extJson: '{}'
                    },
                    ctx: {
                        appVersion: '1.0',
                        platform: 'web'
                    },
                    mtags: {},
                    msgReadStatusSetting: 1
                },
                {
                    actualReceivers: [`${this.user.userId}@goofish`, `${toid}@goofish`]
                }
            ])
            this.ws?.send(msg)
            console.log('Message Sent Successfully')
        } catch (err) {
            console.error('Send Message Error:', err)
            throw err // 根据需求决定是否抛出错误
        }
    }
}
