import { app, shell, BrowserWindow, Tray, nativeImage, Menu } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { DEBUG_HOST, DEBUG_PORT } from './config'
import browserService from './service/browser.service'
import './ipc.main'
import icon from '../../resources/icon.png?asset'
import iconFlash from '../../resources/icon-flash.png?asset'
import sendService from './service/send.service'
import emitterService from './service/emitter.service'
// import log from 'electron-log/main';

// log.initialize()
async function createWindow(): Promise<BrowserWindow> {
    const mainWindow = new BrowserWindow({
        width: 375,
        height: 667,
        show: false,
        autoHideMenuBar: true,
        icon: icon,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            allowRunningInsecureContent: true,
            webSecurity: false, // 允许访问本地资源，包括音频文件
            nodeIntegration: false,
            contextIsolation: true,
        }
        // frame:false,
        // transparent:true,
        // backgroundColor:'#00000000',
        // resizable:false
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'),{
            hash:'home'
        })
    }

    mainWindow.on('close', (e) => {
        e.preventDefault()
        mainWindow.hide()
    })

    return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// set debugport
app.commandLine.appendSwitch('remote-debugging-port', DEBUG_PORT)
app.commandLine.appendSwitch('remote-debugging-address', DEBUG_HOST)
app.commandLine.appendSwitch('disable-web-security', 'NetworkService')
app.commandLine.appendSwitch('user-data-dir', path.resolve(app.getAppPath(), '/temp/chrome'))
app.whenReady().then(async () => {
    electronApp.setAppUserModelId('com.electron')
    app.on('browser-window-created', (_, window) => {
        // bindPuppeteer()
        browserService.connect()
        optimizer.watchWindowShortcuts(window)
    })

    // 注册ipcMain 事件监听
    // registerAllService()
    // 创建window
    const mainWindow = await createWindow()
    sendService.setWind(mainWindow)
    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    // 创建托盘图标（推荐PNG格式适配多平台）
    let isFlashing = false;
    let flashInterval;
    // 修复图标路径问题 - 使用与主窗口相同的icon导入方式
    let originalIcon = icon // 使用已导入的icon
    let flashingIcon = iconFlash // 使用已导入的iconFlash
    let tray = new Tray(
        nativeImage.createFromPath(originalIcon)
    )
    function startFlashing() {
        if (isFlashing) return; // 防止重复启动闪烁
        isFlashing = true;
        let toggle = true;
        flashInterval = setInterval(() => {
            tray.setImage(nativeImage.createFromPath(toggle ? flashingIcon : originalIcon));
            toggle = !toggle; // 切换图标
        }, 500); // 每500毫秒切换一次
    }
    
    function stopFlashing() {
        if (!isFlashing) return; // 如果没有在闪烁中
        isFlashing = false;
        clearInterval(flashInterval);
        tray.setImage(nativeImage.createFromPath(originalIcon)); // 恢复正常图标
    }
    tray.on('click', () => {
        mainWindow.show()
    })
    const contextMenu = Menu.buildFromTemplate([
        { label: '主界面', click: () => mainWindow.show() },
        { label: '退出', click: () => {
            stopFlashing()
            tray.destroy()
            if(process.platform !== 'darwin') {
                app.exit(0)
            }else{
                app.quit()
            }
        } }
    ])
    tray.setContextMenu(contextMenu)

    // 悬停提示
    tray.setToolTip('闲鱼IM')

    emitterService.on('newMsg', (t) => {
        tray.setToolTip(t)
        startFlashing()
    })
    mainWindow.on('show',()=>{
        tray.setToolTip('闲鱼IM')
        stopFlashing()
    })

    mainWindow.on('focus',()=>{
        stopFlashing()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
    // quitePuppeteer()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
