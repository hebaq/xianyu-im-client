import { sandboxManager } from '../sandbox/AccountSandbox'
import { GooFishUser } from '../types'
import { waitFor } from '../utils'
import browserService from './browser.service'
import emitterService from './emitter.service'
import { XyImService } from './im.service'
import { MsgService } from './msg.service'
const msgService = new MsgService()
import sendService from './send.service'
import { userAdd, userGet, userList, userRemove, userUpdate } from './store.service'
import { NotificationService } from './notification.service'
const notificationService = new NotificationService()

export class XyUserService {
    private users = new Map<string, XyImService>()

    async userImLogin(user: GooFishUser) {
        this.userImLogout(user)
        const xyImService = new XyImService(user)
        await xyImService.init()
        this.users.set(user.userId, xyImService)
        xyImService.on('message', async (msg) => {
            // TODO: 暂时先注释，后面优化自动回复
            // xyImService.readMsg(msg); // 此处自动已读消息
            // msgService.handleMsg(msg, xyImService)
            // 发送格式化的消息预览到UI日志，显示账号信息和客户信息
            const messagePreview = msg.type === 'image' 
                ? `📷 [${user.displayName}] 收到 ${msg.senderName} 发送的图片`
                : `💬 [${user.displayName}] 收到 ${msg.senderName}: ${msg.content.length > 30 ? msg.content.substring(0, 30) + '...' : msg.content}`
            sendService.log2renderer(`新消息`, messagePreview)
            
            // 显示系统通知和播放声音
            await notificationService.showNewMessageNotification(
                user.userId,
                msg.senderName,
                msg.content,
                () => {
                    // 点击通知时显示主窗口
                    sendService.getMainWindow()?.show()
                    sendService.getMainWindow()?.focus()
                }
            )
            
            const olduser = userGet(user.userId)
            if (olduser) {
                olduser.unread = true
                userUpdate(olduser)
                sendService.send2renderer('refreshUserList')
                emitterService.emit('newMsg',`来自 ${msg.senderName} 的新消息`)
            }
        })
        xyImService.on('connected', () => {
            const olduser = userGet(user.userId)
            if (olduser) {
                olduser.online = true
                userUpdate(olduser)
                sendService.log2renderer('im连接成功', user.displayName)
                sendService.send2renderer('refreshUserList')
            }
        })
        userAdd(user)
        sendService.send2renderer('refreshUserList')
    }

    async userRemove(user:GooFishUser){
        this.userImLogout(user)
        userRemove(user)
        sendService.log2renderer('解除绑定',user.displayName)
        sendService.send2renderer('refreshUserList')
    }

    userImLogout(user: GooFishUser) {
        if (this.users.has(user.userId)) {
            const xyImService = this.users.get(user.userId)
            xyImService?.disconnect() // 使用新的断开连接方法
            this.users.delete(user.userId)
            user.online = false
            userUpdate(user)
        }
        sendService.log2renderer('断开连接',user.displayName + ' 断开连接')
        sendService.send2renderer('refreshUserList')
    }

    async login() {
        const wind = sandboxManager.createSandbox(new Date().getTime() + '').browserWindow
        const page = await browserService.getPage(wind)
        if (!page) {
            sendService.log2renderer('登录失败', '无法打开网页', 0)
            // error handler
            return
        }
        await browserService.initPage(page)
        await page.goto('https://www.goofish.com/login', {
            referer: 'https://www.goofish.com/'
        })
        // 请在五分钟内完成登录
        try {
            await page.waitForNavigation({
                timeout: 5 * 60 * 1000
            })
        } catch (_) {
            // notifyAndLog('绑定失败', '登录超时，请重试', true)
            sendService.log2renderer('绑定失败', '登录超时，请重试', 0, true)
            wind.close()
            return
        }
        const userInfo: GooFishUser = {
            userId: '',
            avatar: '',
            displayName: '',
            lastLogin: '',
            cookies: [],
            accessToken: '',
            unread: false,
            online: false
        }
        if (page.url().endsWith('www.goofish.com/')) {
            page.on('response', async (response) => {
                const req = response.request()
                const method = req.method()
                const url = response.url()
                if (url.includes('pc.loginuser.get') && method.toLocaleLowerCase() === 'post') {
                    const bodyData = await response.json()
                    userInfo.userId = bodyData.data.userId
                    userInfo.lastLogin = new Date().getTime() + ''
                }
                if (
                    url.includes('mtop.idle.web.user.page.nav') &&
                    method.toLocaleLowerCase() === 'post'
                ) {
                    const respData = await response.json()
                    userInfo.avatar = respData.data.module.base.avatar
                    userInfo.displayName = respData.data.module.base.displayName
                }
            })
            await page.goto('https://www.goofish.com/im')
        } else {
            sendService.log2renderer('绑定失败', '登录超时，请重试', 0, true)
            wind.close()
            return
        }
        // 等待读取用户信息
        await waitFor(() => userInfo.userId != '' && userInfo.displayName != '', 10)
        const cookies = await page.cookies()
        userInfo.cookies = cookies
        sendService.log2renderer('登录成功', userInfo.displayName + ' 登录成功', 1, true)
        await this.userImLogin(userInfo)
        wind.close()
    }

    async reLogin(userId: string) {
        const user = userGet(userId)
        if (!user) {
            //
            sendService.log2renderer(`登录失败`, `用户${userId}不存在，请重新登录`, 0)
            return
        }
        let newAccessToken: string = ''
        const wind = sandboxManager.createSandbox(userId).browserWindow
        const page = await browserService.getPage(wind)
        if (!page) {
            //
            sendService.log2renderer(`登录失败`, `打开页面失败，请重新登录`, 0)
            wind.close()
            return
        }
        await browserService.initPage(page)
        page.on('response', async (response) => {
            const req = response.request()
            const method = req.method()
            const url = response.url()
            if (
                url.includes('pc.login.token') &&
                method.toLocaleLowerCase() === 'post' &&
                response.status() == 200
            ) {
                const body = await response.json()
                newAccessToken = body.data.accessToken
            }
        })
        await page.setCookie(...user.cookies)
        try {
            await page.goto('https://www.goofish.com/im', {
                timeout: 30 * 6000
            })
        } catch (_) {
            //
            sendService.log2renderer(`登录失败`, `跳转聊天界面失败，用户已过期，请重新登录`, 0)
            userRemove(user)
            sendService.send2renderer('refreshUserList')
            wind.close()
            return
        }
        try {
            await waitFor(() => newAccessToken != '')
            sendService.log2renderer(`登录成功`, user.displayName, 1)
            user.lastLogin = new Date().getTime() + ''
            user.cookies = await page.cookies()
            user.unread = false
            userUpdate(user)
            sendService.send2renderer('refreshUserList')
            await this.userImLogin(user)
            return
        } catch (err: any) {
            // Log the error but do not close the window, as the user's main intention is to open it.
            // The token refresh can be considered a background task.
            sendService.log2renderer(
                `Token刷新失败`,
                '用户 ' + user.displayName + ' 的Token刷新失败，但这不影响使用。',
                0,
                true
            )
            // Do not close the window or remove the user.
            // wind.close()
            // userRemove(user)
            // sendService.send2renderer('refreshUserList')
            return
        }
    }

    async initUserImLogin() {
        const users = userList()
        for (const user of users) {
            user.unread = false
            userUpdate(user)
            await this.userImLogin(user)
        }
    }
}
