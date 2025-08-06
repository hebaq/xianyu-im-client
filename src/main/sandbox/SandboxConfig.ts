import { GlobalConfig, AccountConfig, MergedConfig } from '../types/sandbox.types'

// Default global configuration
const defaultGlobalConfig: GlobalConfig = {
  theme: 'light'
}

// Default configuration for a new account
const defaultAccountConfig: AccountConfig = {
  autoReply: {
    enabled: false,
    message: 'Sorry, I am currently away.'
  },
  notifications: {
    enabled: true,
    sound: 'default'
  }
}

class SandboxConfig {
  private globalConfig: GlobalConfig = defaultGlobalConfig
  private accountConfigs = new Map<string, AccountConfig>()

  constructor() {
    // In a real app, you would load the global config and account configs from a persistent store.
  }

  getEffectiveConfig(userId: string): MergedConfig {
    const accountConfig = this.accountConfigs.get(userId) || defaultAccountConfig
    // Merge global and account-specific configurations
    return {
      ...this.globalConfig,
      ...accountConfig
    }
  }

  setAccountConfig(userId: string, config: Partial<AccountConfig>): void {
    const currentConfig = this.accountConfigs.get(userId) || defaultAccountConfig
    const newConfig = { ...currentConfig, ...config }
    this.accountConfigs.set(userId, newConfig)
    // In a real app, you would save this to a persistent store.
  }

  getAccountConfig(userId: string): AccountConfig {
    return this.accountConfigs.get(userId) || defaultAccountConfig
  }

  setGlobalConfig(config: Partial<GlobalConfig>): void {
    this.globalConfig = { ...this.globalConfig, ...config }
    // In a real app, you would save this to a persistent store.
  }
}

export const sandboxConfig = new SandboxConfig()
