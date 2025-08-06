import { Permission } from '../types/sandbox.types'

class SecurityManager {
  // For demonstration, using a simple in-memory map.
  // In a real app, this would be backed by a persistent store.
  private accountPermissions = new Map<string, Permission[]>()

  constructor() {
    // Default permissions for a user
    this.accountPermissions.set('default-user', ['read', 'write'])
  }

  checkPermission(userId: string, action: Permission): boolean {
    const permissions = this.accountPermissions.get(userId) || []
    return permissions.includes(action)
  }

  grantPermission(userId: string, permission: Permission): void {
    const permissions = this.accountPermissions.get(userId) || []
    if (!permissions.includes(permission)) {
      permissions.push(permission)
      this.accountPermissions.set(userId, permissions)
    }
  }

  revokePermission(userId: string, permission: Permission): void {
    let permissions = this.accountPermissions.get(userId) || []
    if (permissions.includes(permission)) {
      permissions = permissions.filter((p) => p !== permission)
      this.accountPermissions.set(userId, permissions)
    }
  }
}

export const securityManager = new SecurityManager()
