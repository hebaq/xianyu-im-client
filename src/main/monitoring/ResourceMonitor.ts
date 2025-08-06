import { AccountMetrics } from '../types/sandbox.types'

class ResourceMonitor {
  private accountMetrics = new Map<string, AccountMetrics>()
  private monitoringIntervals = new Map<string, NodeJS.Timeout>()

  startMonitoring(userId: string): void {
    if (this.monitoringIntervals.has(userId)) {
      return // Already monitoring
    }

    const interval = setInterval(() => {
      // In a real implementation, you would collect actual metrics here.
      // For now, we'll use random placeholder data.
      const metrics: AccountMetrics = {
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 500, // in MB
        networkUsage: Math.random() * 10 // in MB/s
      }
      this.accountMetrics.set(userId, metrics)
    }, 5000) // Collect data every 5 seconds

    this.monitoringIntervals.set(userId, interval)
  }

  stopMonitoring(userId: string): void {
    const interval = this.monitoringIntervals.get(userId)
    if (interval) {
      clearInterval(interval)
      this.monitoringIntervals.delete(userId)
      this.accountMetrics.delete(userId)
    }
  }

  getMetrics(userId: string): AccountMetrics | undefined {
    return this.accountMetrics.get(userId)
  }

  getAllMetrics(): Map<string, AccountMetrics> {
    return this.accountMetrics
  }
}

export const resourceMonitor = new ResourceMonitor()
