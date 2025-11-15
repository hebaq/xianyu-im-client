import { ipcMain, session } from 'electron'
import { XyUserService } from './service/user.service'
import { IpcMainEvents,IpcInvokeEvents } from './types'
import { userAdd, userGet, userList, getBarkConfig, setBarkConfig } from './service/store.service'

const xyUserService = new XyUserService()

function addEvent<T extends keyof IpcMainEvents>(event: T, listener: IpcMainEvents[T]) {
    ipcMain.on(event, (_,params)=>listener(params))
}

function handleInvoke<T extends keyof IpcInvokeEvents>(event: T, listener: IpcInvokeEvents[T]) {
    ipcMain.handle(event, (_, ...args) => (listener as any)(...args))
}

addEvent('userGet',(params)=>{
    return userGet(params)
})

handleInvoke('userList',()=>{
    return userList()
})

addEvent('userRemove',user=>{
    xyUserService.userRemove(user)
})

addEvent('userAdd',user=>{
    return userAdd(user)
})

addEvent('xianyuLogin',()=>{
    xyUserService.login()
})

addEvent('xianyuImLogout',(user)=>{
    xyUserService.userImLogout(user)
})
addEvent('xianyuImLogin',user=>{
    xyUserService.userImLogin(user)
})

addEvent('xianyuReLogin',userId=>{
    xyUserService.reLogin(userId)
})

addEvent('loadUserChatPage',(userId)=>{
    xyUserService.loadUserChatPage(userId)
})

handleInvoke('setWebviewCookiesSync', async (data) => {
    try {
        const ses = session.fromPartition(data.partition)
        
        // 设置所有 cookies
        for (const cookie of data.cookies) {
            await ses.cookies.set({
                url: 'https://www.goofish.com',
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain || '.goofish.com',
                path: cookie.path || '/',
                secure: cookie.secure !== false,
                httpOnly: cookie.httpOnly !== false,
                expirationDate: cookie.expirationDate
            })
        }
        
        console.log(`✅ Cookies set for ${data.partition}: ${data.cookies.length} cookies`)
        return true
    } catch (err) {
        console.error('❌ Failed to set webview cookies:', err)
        return false
    }
})

handleInvoke('getBarkConfig', async () => {
    return getBarkConfig()
})

handleInvoke('setBarkConfig', async (config) => {
    setBarkConfig(config)
})

addEvent('onMounted',()=>{
    xyUserService.initUserImLogin()
})