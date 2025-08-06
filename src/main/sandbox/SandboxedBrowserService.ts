import { BrowserWindow, session } from 'electron'
import path from 'path'
import { is } from '@electron-toolkit/utils'

class SandboxedBrowserService {
  private browserWindows = new Map<string, BrowserWindow>()

  private getSession(userId: string) {
    return session.fromPartition(`persist:user-${userId}`)
  }

  createBrowserWindow(userId: string): BrowserWindow {
    const userSession = this.getSession(userId)

    // Determine window size based on user
    const isMainWindow = userId === 'default-user'
    const windowOptions = {
      width: isMainWindow ? 375 : 1200,
      height: isMainWindow ? 667 : 900,
      show: false,
      autoHideMenuBar: true,
      icon: path.join(__dirname, '../../resources/icon.png'),
      webPreferences: {
        session: userSession,
        preload: path.join(__dirname, '../preload/index.js'), // Correct path for dev
        sandbox: false, // Disable sandbox for now to fix ipcRenderer issue
        contextIsolation: true, // Recommended for security
        webSecurity: false,
        allowRunningInsecureContent: true
      }
    }

    const newWindow = new BrowserWindow(windowOptions)

    // Load the page
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      newWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      newWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    // Show window when ready to prevent flashing
    newWindow.once('ready-to-show', () => {
      newWindow.show()
    })

    this.browserWindows.set(userId, newWindow)

    newWindow.on('closed', () => {
      this.browserWindows.delete(userId)
    })

    return newWindow
  }

  getBrowserWindow(userId: string): BrowserWindow | undefined {
    return this.browserWindows.get(userId)
  }

  destroyBrowserWindow(userId: string): void {
    const window = this.browserWindows.get(userId)
    if (window) {
      window.close()
      this.browserWindows.delete(userId)
    }
  }
}

export const sandboxedBrowserService = new SandboxedBrowserService()