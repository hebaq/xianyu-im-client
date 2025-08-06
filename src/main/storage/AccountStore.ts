import Store from 'electron-store'
import { app } from 'electron'
import path from 'path'

class AccountStore {
  private storeInstances = new Map<string, Store>()

  private getStorePath(userId: string): string {
    return path.join(app.getPath('userData'), `account-${userId}.json`)
  }

  getAccountStore(userId: string): Store {
    if (!this.storeInstances.has(userId)) {
      const store = new Store({
        cwd: this.getStorePath(userId)
      })
      this.storeInstances.set(userId, store)
    }
    return this.storeInstances.get(userId)!
  }

  deleteAccountStore(userId: string): void {
    const store = this.storeInstances.get(userId)
    if (store) {
      // You might want to delete the file from disk as well
      // fs.unlinkSync(this.getStorePath(userId));
      this.storeInstances.delete(userId)
    }
  }
}

export const accountStore = new AccountStore()
