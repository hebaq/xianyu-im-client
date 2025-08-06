// 直接导入音频文件从assets目录
import qqSoundUrl from '../assets/qq.mp3'

/**
 * 音频播放服务
 */
class AudioService {
    private audioElement: HTMLAudioElement | null = null
    private localSoundUrl: string = qqSoundUrl

    /**
     * 播放音频文件
     */
    async playSound(): Promise<void> {
        try {
            // 如果已有音频在播放，先停止
            if (this.audioElement) {
                this.audioElement.pause()
                this.audioElement.currentTime = 0
            }

            // 创建新的音频元素
            this.audioElement = new Audio()
            
            // 使用本地导入的音频文件
            this.audioElement.src = this.localSoundUrl
            this.audioElement.volume = 0.7
            
            // 添加错误处理
            this.audioElement.addEventListener('error', () => {
                this.playLocalSound()
            })
            
            // 播放音频
            await this.audioElement.play()
            
        } catch (error) {
            // 备用方案：使用Web Audio API生成音频
            try {
                await this.playLocalSound()
            } catch (fallbackError) {
                console.error('音频播放失败:', fallbackError)
            }
        }
    }

    /**
     * 播放本地嵌入的音频资源（备用方案）
     */
    private async playLocalSound(): Promise<void> {
        // 可以使用Web Audio API或者预加载的音频
        // 这里使用一个简单的提示音
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // 创建一个简单的提示音
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 800 // 800Hz的音调
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
        
        // 使用备用提示音
    }

    /**
     * 停止当前播放的音频
     */
    stopSound(): void {
        if (this.audioElement) {
            this.audioElement.pause()
            this.audioElement.currentTime = 0
        }
    }

    /**
     * 测试音频播放功能
     */
    async testSound(): Promise<void> {
        console.log('音频测试')
        await this.playSound()
    }
}

export default new AudioService()