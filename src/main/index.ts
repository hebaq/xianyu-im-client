import { app, shell, BrowserWindow, Tray, nativeImage, Menu, globalShortcut } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { DEBUG_HOST, DEBUG_PORT } from './config'
import browserService from './service/browser.service'
import './ipc.main'
import icon from '../../resources/icon.png?asset'
import iconFlash from '../../resources/icon-flash.png?asset'
import sendService from './service/send.service'
import emitterService from './service/emitter.service'

async function createWindow(): Promise<BrowserWindow> {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        autoHideMenuBar: true,
        icon: icon,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            webviewTag: true,
            allowRunningInsecureContent: true,
            webSecurity: false, // 允许访问本地资源，包括音频文件
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'), {
            hash: 'home'
        })
    }

    mainWindow.on('close', (e) => {
        e.preventDefault()
        mainWindow.hide()
    })

    return mainWindow
}

app.commandLine.appendSwitch('remote-debugging-port', DEBUG_PORT)
app.commandLine.appendSwitch('remote-debugging-address', DEBUG_HOST)
app.commandLine.appendSwitch('disable-web-security', 'NetworkService')
app.commandLine.appendSwitch('user-data-dir', path.resolve(app.getAppPath(), '/temp/chrome'))
// 忽略证书错误，解决 SSL 握手失败问题
app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('allow-insecure-localhost')
app.whenReady().then(async () => {
    electronApp.setAppUserModelId('com.electron')
    app.on('browser-window-created', (_, window) => {
        browserService.connect()
        optimizer.watchWindowShortcuts(window)
    })

    const mainWindow = await createWindow()
    sendService.setWind(mainWindow)

    const ret = globalShortcut.register('CommandOrControl+Alt+Q', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide()
        } else {
            mainWindow.show()
            mainWindow.focus()
        }
    })

    if (!ret) {
        console.log('全局快捷键注册失败')
    }
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

    let isFlashing = false
    let flashInterval
    
    const originalIcon = nativeImage.createFromPath(icon)
    const flashingIcon = nativeImage.createFromPath(iconFlash)
    
    if (originalIcon.isEmpty() || flashingIcon.isEmpty()) {
        console.error('Failed to load tray icons')
    }
    let tray = new Tray(originalIcon)
    function startFlashing() {
        if (isFlashing) return
        isFlashing = true
        let toggle = true
        flashInterval = setInterval(() => {
            tray.setImage(toggle ? flashingIcon : originalIcon)
            toggle = !toggle
        }, 500)
    }

    function stopFlashing() {
        if (!isFlashing) return
        isFlashing = false
        clearInterval(flashInterval)
        tray.setImage(originalIcon)
    }
    tray.on('click', () => {
        mainWindow.show()
    })
    const contextMenu = Menu.buildFromTemplate([
        { label: '主界面', click: () => mainWindow.show() },
        {
            label: '退出',
            click: () => {
                stopFlashing()
                tray.destroy()
                globalShortcut.unregisterAll()
                if (process.platform !== 'darwin') {
                    app.exit(0)
                } else {
                    app.quit()
                }
            }
        }
    ])
    tray.setContextMenu(contextMenu)

    tray.setToolTip('闲鱼助手')

    emitterService.on('newMsg', (t) => {
        tray.setToolTip(t)
        startFlashing()
    })

    mainWindow.on('show', () => {
        tray.setToolTip('闲鱼助手')
        stopFlashing()
    })

    mainWindow.on('focus', () => {
        stopFlashing()
    })
})

app.on('window-all-closed', () => {
    globalShortcut.unregisterAll()
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
