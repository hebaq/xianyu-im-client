import { Notification } from 'electron'
import sendService from './send.service'

export interface NotificationOptions {
    title: string
    body: string
    icon?: string
    playSound?: boolean
    onClick?: () => void
}

export class NotificationService {
    constructor() {
        // 通知服务初始化
    }

    /**
     * 显示系统通知
     * @param options 通知选项
     */
    async showNotification(_userId: string, options: NotificationOptions): Promise<void> {
        try {
            // TODO: Add account-specific notification logic here
            // For example, get user's notification preferences from a config service
            // const userConfig = accountConfigService.getConfig(userId);
            // if (!userConfig.notifications.enabled) return;

            // 检查通知权限
            if (!Notification.isSupported()) {
                console.warn('系统通知不被支持')
                return
            }

            const notification = new Notification({
                title: options.title,
                body: options.body,
                icon: options.icon,
                silent: !options.playSound, // 如果需要播放声音则不静音
                urgency: 'normal'
            })

            // 点击通知的回调
            if (options.onClick) {
                notification.on('click', options.onClick)
            }

            notification.show()

            // 播放自定义声音（如果需要且系统通知静音）
            if (options.playSound) {
                await this.playSound()
            }

        } catch (error) {
            console.error('显示通知失败:', error)
        }
    }

    /**
     * 播放提示音
     */
    private async playSound(): Promise<void> {
        try {
            // 在主进程中播放音频需要使用HTML5 Audio
            // 但由于主进程限制，我们使用shell.openExternal的替代方案
            // 或者可以通过渲染进程来播放
            await this.playAudioInRenderer()
        } catch (error) {
            console.error('播放提示音失败:', error)
        }
    }

    /**
     * 通过渲染进程播放音频
     */
    private async playAudioInRenderer(): Promise<void> {
        try {
            // 通过sendService向渲染进程发送播放音频的请求
            sendService.send2renderer('playNotificationSound')
        } catch (error) {
            console.error('播放音频失败:', error)
        }
    }

    /**
     * 显示新消息通知
     * @param senderName 发送者名称
     * @param content 消息内容
     * @param onClickCallback 点击通知的回调
     */
    async showNewMessageNotification(
        userId: string,
        senderName: string, 
        content: string, 
        onClickCallback?: () => void
    ): Promise<void> {
        await this.showNotification(userId, {
            title: `来自 ${senderName} 的新消息`,
            body: content.length > 50 ? content.substring(0, 50) + '...' : content,
            playSound: true,
            onClick: onClickCallback
        })
    }
}

