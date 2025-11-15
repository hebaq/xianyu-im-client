import { GooFishUser, BarkConfig } from '../types'
import { accountStore } from '../storage/AccountStore'
import { encryptionService } from '../storage/EncryptionService'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import Store from 'electron-store'

const USER_DATA_KEY = 'userData'

// Global config store for Bark settings
type ConfigStore = {
    barkConfig: BarkConfig
}
const configStore = new Store<ConfigStore>({
    name: 'goofish-config',
    defaults: {
        barkConfig: {
            enabled: false,
            url: ''
        }
    }
})

function getAccountStore(userId: string) {
  return accountStore.getAccountStore(userId)
}

export function userAdd(user: GooFishUser) {
  const store = getAccountStore(user.userId)
  const encryptedUser = encryptionService.encrypt(JSON.stringify(user))
  store.set(USER_DATA_KEY, encryptedUser)
}

export function userRemove(user: GooFishUser) {
  console.log(`[StoreService] 🗑️ Deleting user data: ${user.userId}`)
  accountStore.deleteAccountStore(user.userId)
  console.log(`[StoreService] ✅ Account store deleted`)
  
  // Also delete the file from disk with retry
  const storePath = path.join(app.getPath('userData'), `account-${user.userId}.json`)
  console.log(`[StoreService] 📁 Checking file: ${storePath}`)
  
  if (fs.existsSync(storePath)) {
    // 检查是文件还是目录
    const stats = fs.statSync(storePath)
    
    if (stats.isDirectory()) {
      // 如果是目录，删除整个目录
      console.log(`[StoreService] ⚠️ Path is a directory, removing directory...`)
      try {
        fs.rmSync(storePath, { recursive: true, force: true })
        console.log(`[StoreService] ✅ Directory deleted from disk`)
      } catch (error: any) {
        console.error(`[StoreService] ❌ Failed to delete directory:`, error.message)
      }
    } else {
      // 尝试删除文件，如果失败则重试
      let retries = 3
      let deleted = false
      
      while (retries > 0 && !deleted) {
        try {
          fs.unlinkSync(storePath)
          console.log(`[StoreService] ✅ File deleted from disk`)
          deleted = true
        } catch (error: any) {
          retries--
          if (error.code === 'EPERM' && retries > 0) {
            console.log(`[StoreService] ⚠️ File is locked, retrying... (${retries} attempts left)`)
            // 等待一下再重试
            const waitMs = 100
            const start = Date.now()
            while (Date.now() - start < waitMs) {
              // 同步等待
            }
          } else {
            console.error(`[StoreService] ❌ Failed to delete file:`, error.message)
            // 如果删除失败，至少清空文件内容
            try {
              fs.writeFileSync(storePath, '{}')
              console.log(`[StoreService] ⚠️ File cleared instead of deleted`)
            } catch (writeError) {
              console.error(`[StoreService] ❌ Failed to clear file:`, writeError)
            }
          }
        }
      }
    }
  } else {
    console.log(`[StoreService] ⚠️ File not found on disk`)
  }
}

export function userGet(userId: string): GooFishUser | undefined {
  try {
    const store = getAccountStore(userId)
    const encryptedUser = store.get(USER_DATA_KEY) as string | undefined
    if (encryptedUser) {
      const decryptedUser = encryptionService.decrypt(encryptedUser)
      return JSON.parse(decryptedUser) as GooFishUser
    }
  } catch (error) {
    console.error(`[StoreService] ❌ Failed to get user ${userId}:`, error)
  }
  return undefined
}

export function userUpdate(user: GooFishUser) {
  userAdd(user)
}

export function userList(): GooFishUser[] {
  const users: GooFishUser[] = []
  const userDataPath = app.getPath('userData')
  const files = fs.readdirSync(userDataPath)

  files.forEach((file) => {
    if (file.startsWith('account-') && file.endsWith('.json')) {
      const userId = file.replace('account-', '').replace('.json', '')
      const user = userGet(userId)
      // 只添加有效的用户数据（有 userId 和 displayName）
      if (user && user.userId && user.displayName) {
        users.push(user)
      } else {
        console.log(`[StoreService] ⚠️ Skipping invalid user data for: ${userId}`)
      }
    }
  })

  return users
}

export function getBarkConfig(): BarkConfig {
    return configStore.get('barkConfig')
}

export function setBarkConfig(config: BarkConfig) {
    configStore.set('barkConfig', config)
}
