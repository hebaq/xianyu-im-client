export interface Account {
  userId: string
  displayName: string
  // Add other account-related properties here
}

export interface AccountMetrics {
  cpuUsage: number
  memoryUsage: number
  networkUsage: number
}

export interface AccountConfig {
  autoReply: {
    enabled: boolean
    message: string
  }
  notifications: {
    enabled: boolean
    sound: string
  }
}

export interface GlobalConfig {
  theme: string
  // Add other global settings here
}

export type MergedConfig = GlobalConfig & AccountConfig

export type Permission = 'read' | 'write' | 'delete'
