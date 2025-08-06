import { GooFishUser } from '../types'
import { accountStore } from '../storage/AccountStore'
import { encryptionService } from '../storage/EncryptionService'
import { app } from 'electron'
import fs from 'fs'
import path from 'path'

const USER_DATA_KEY = 'userData'

function getAccountStore(userId: string) {
  return accountStore.getAccountStore(userId)
}

export function userAdd(user: GooFishUser) {
  const store = getAccountStore(user.userId)
  const encryptedUser = encryptionService.encrypt(JSON.stringify(user))
  store.set(USER_DATA_KEY, encryptedUser)
}

export function userRemove(user: GooFishUser) {
  accountStore.deleteAccountStore(user.userId)
  // Also delete the file from disk
  const storePath = path.join(app.getPath('userData'), `account-${user.userId}.json`)
  if (fs.existsSync(storePath)) {
    fs.unlinkSync(storePath)
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
    console.error(`Failed to get user ${userId}:`, error)
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
      if (user) {
        users.push(user)
      }
    }
  })

  return users
}
