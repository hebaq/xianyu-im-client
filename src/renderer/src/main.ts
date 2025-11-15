import router from '@renderer/router/index'
import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:uno.css'
import './style/reset.css'
import './style/base.scss'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import { addEvent } from './utils/ipc.listener'
import audioService from './utils/audio.service'

const app = createApp(App)
app.use(router)
    .use(PrimeVue, {
        theme: {
            preset: Aura,
            locale: 'zh-CN'
        }
    })
    .use(ToastService)
    .mount('#app')

// 添加音频播放的IPC事件监听器
addEvent('playNotificationSound', () => {
    audioService.playSound()
})

// 在开发模式下暴露测试方法到全局
if (import.meta.env.DEV) {
    (window as any).testAudio = () => {
        audioService.testSound()
    }
}
