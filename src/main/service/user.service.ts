import { sandboxManager } from '../sandbox/AccountSandbox'
import { GooFishUser } from '../types'
import { waitFor } from '../utils'
import browserService from './browser.service'
import emitterService from './emitter.service'
import { XyImService } from './im.service'
// import { MsgService } from './msg.service'
// const msgService = new MsgService()
import sendService from './send.service'
import { userAdd, userGet, userList, userRemove, userUpdate } from './store.service'
import { NotificationService } from './notification.service'
import barkService from './bark.service'
import xyJsModule from '../libs/xianyu_js_version_2.cjs'

const notificationService = new NotificationService()

export class XyUserService {
    private users = new Map<string, XyImService>()

    async userImLogin(user: GooFishUser) {
        this.userImLogout(user)
        const xyImService = new XyImService(user) // 这里会生成或复用 deviceId
        
        // XyImService 构造函数可能生成了新的 deviceId，需要保存
        if (user.deviceId) {
            userUpdate(user)
        }
        
        try {
            await xyImService.init()
        } catch (error: any) {
            console.error(`[UserService] ❌ IM初始化失败:`, error)
            
            // 检查是否需要重新登录
            if (error.message && error.message.startsWith('NEED_RELOGIN:')) {
                const errorMsg = error.message.replace('NEED_RELOGIN:', '')
                console.log(`[UserService] ❌ 登录已失效: ${errorMsg}`)
                
                sendService.log2renderer(
                    '登录失效',
                    `用户 ${user.displayName} 登录已失效，请删除账号重新添加`,
                    0,
                    true
                )
                
                // 标记账号为离线
                user.online = false
                userUpdate(user)
                sendService.send2renderer('refreshUserList')
                return
            }
            
            // 检查是否需要验证
            if (error.message && error.message.startsWith('NEED_VERIFY:')) {
                const verifyUrl = error.message.replace('NEED_VERIFY:', '')
                console.log(`[UserService] 🔓 打开验证窗口:`, verifyUrl)
                
                // 创建验证窗口
                const verifyWindow = sandboxManager.createSandbox(user.userId + '-verify').browserWindow
                const page = await browserService.getPage(verifyWindow)
                
                if (page) {
                    await page.goto(verifyUrl)
                    
                    sendService.log2renderer(
                        '需要验证',
                        `用户 ${user.displayName} 需要完成滑块验证。完成后会跳转到淘宝页面，这是正常的。请关闭验证窗口，然后再次点击账号上线即可`,
                        0,
                        true
                    )
                    
                    // 使用标志防止重复处理
                    let verificationHandled = false
                    
                    // 监听页面导航，检测验证是否成功
                    page.on('framenavigated', async (frame) => {
                        if (frame === page.mainFrame() && !verificationHandled) {
                            const url = frame.url()
                            console.log(`[UserService] 🔍 页面导航到: ${url}`)
                            
                            // 如果跳转到淘宝或闲鱼主页，说明验证成功
                            if ((url.includes('taobao.com') || url.includes('goofish.com')) && 
                                !url.includes('punish') && 
                                !url.includes('login') &&
                                !url.includes('passport')) {
                                console.log(`[UserService] ✅ 验证成功，已跳转到: ${url}`)
                                verificationHandled = true // 标记为已处理
                                
                                // 获取最新的 cookies 并更新用户数据
                                try {
                                    // 等待页面稳定
                                    await new Promise(resolve => setTimeout(resolve, 2000))
                                    
                                    // 获取所有域名的 cookies 并合并
                                    const allCookies = await page.cookies()
                                    const goofishCookies = await page.cookies('https://www.goofish.com')
                                    const taobaoCookies = await page.cookies('https://www.taobao.com')
                                    
                                    const cookieMap = new Map()
                                    for (const cookie of [...allCookies, ...goofishCookies, ...taobaoCookies]) {
                                        const key = `${cookie.name}_${cookie.domain}`
                                        cookieMap.set(key, cookie)
                                    }
                                    const newCookies = Array.from(cookieMap.values())
                                    
                                    // 更新用户的 cookies
                                    user.cookies = newCookies
                                    
                                    // 确保 deviceId 存在
                                    if (!user.deviceId) {
                                        user.deviceId = xyJsModule.generate_device_id(user.userId)
                                    }
                                    
                                    userUpdate(user)
                                    
                                    sendService.log2renderer(
                                        '验证成功',
                                        `用户 ${user.displayName} 验证成功！Cookies 已更新 (${newCookies.length} 个)。请关闭此窗口，然后再次点击账号上线`,
                                        1,
                                        true
                                    )
                                } catch (error) {
                                    console.error(`[UserService] ❌ 更新 cookies 失败:`, error)
                                    sendService.log2renderer(
                                        '验证失败',
                                        `用户 ${user.displayName} Cookies 更新失败，请重新验证`,
                                        0,
                                        true
                                    )
                                }
                            }
                        }
                    })
                }
                return
            }
            
            sendService.log2renderer(
                '连接失败',
                `用户 ${user.displayName} IM连接失败，可能触发风控，请稍后重试或重新登录`,
                0,
                true
            )
            return
        }
        this.users.set(user.userId, xyImService)
        console.log(`[UserService] Registering message listener for user: ${user.userId}`)
        xyImService.on('message', async (msg) => {
            // 过滤掉自己发送的消息
            if (String(msg.senderUserId) === String(user.userId)) {
                return
            }
            
            // TODO: 暂时先注释，后面优化自动回复
            // xyImService.readMsg(msg); // 此处自动已读消息
            // msgService.handleMsg(msg, xyImService)
            // 发送格式化的消息预览到UI日志，显示账号信息和客户信息
            const messagePreview = msg.type === 'image' 
                ? `📷 [${user.displayName}] 收到 ${msg.senderName} 发送的图片`
                : `💬 [${user.displayName}] 收到 ${msg.senderName}: ${msg.content.length > 30 ? msg.content.substring(0, 30) + '...' : msg.content}`
            sendService.log2renderer(`新消息`, messagePreview)
            
            // 显示系统通知
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
                olduser.unreadCount = (olduser.unreadCount || 0) + 1
                userUpdate(olduser)
                sendService.send2renderer('refreshUserList')
                emitterService.emit('newMsg',`来自 ${msg.senderName} 的新消息`)
                
                // 发送 Bark 通知
                try {
                    await barkService.sendNotification(
                        `${olduser.displayName} 新消息`,
                        `来自 ${msg.senderName}: ${msg.content || '收到新消息'}`
                    )
                } catch (error: any) {
                    console.error(`[UserService] ❌ Bark notification failed:`, error?.message || error)
                }
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
        console.log(`[UserService] 🗑️ Removing user: ${user.userId} (${user.displayName})`)
        // 先断开连接
        if (this.users.has(user.userId)) {
            const xyImService = this.users.get(user.userId)
            xyImService?.disconnect()
            this.users.delete(user.userId)
            console.log(`[UserService] ✅ Disconnected and removed from active users map`)
        }
        // 然后删除用户数据（不要调用 userImLogout，因为它会更新用户数据）
        userRemove(user)
        console.log(`[UserService] ✅ User data deleted from store`)
        sendService.log2renderer('解除绑定',user.displayName)
        sendService.send2renderer('refreshUserList')
    }

    userImLogout(user: GooFishUser) {
        if (this.users.has(user.userId)) {
            const xyImService = this.users.get(user.userId)
            xyImService?.disconnect() // 使用新的断开连接方法
            this.users.delete(user.userId)
        }
        // 只更新在线状态，不重新保存用户数据
        const existingUser = userGet(user.userId)
        if (existingUser) {
            existingUser.online = false
            userUpdate(existingUser)
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
                try {
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
                } catch (err) {
                    // Ignore response parsing errors
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
        
        // 生成并保存 deviceId
        userInfo.deviceId = xyJsModule.generate_device_id(userInfo.userId)
        
        // 保存用户信息
        userAdd(userInfo)
        sendService.send2renderer('refreshUserList')
        
        sendService.log2renderer(
            '添加成功', 
            `账号 ${userInfo.displayName} 已添加！请关闭此窗口，然后点击账号上线`, 
            1, 
            true
        )
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
            try {
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
            } catch (err) {
                // Ignore response parsing errors
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

    async loadUserChatPage(userId: string) {
        const user = userGet(userId)
        if (!user) {
            sendService.log2renderer('加载失败', `用户${userId}不存在`, 0)
            return
        }
        
        if (!user.cookies || user.cookies.length === 0) {
            sendService.log2renderer('加载失败', `用户${user.displayName}没有cookies，请重新登录`, 0)
            return
        }
        
        // 清除未读数
        user.unread = false
        user.unreadCount = 0
        userUpdate(user)
        sendService.send2renderer('refreshUserList')
        
        sendService.send2renderer('switchToUser', {
            userId: user.userId,
            cookies: user.cookies
        })
    }
}
