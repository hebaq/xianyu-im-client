import { getBarkConfig } from './store.service'
import axios from 'axios'

class BarkService {
    async sendNotification(title: string, body: string) {
        const config = getBarkConfig()
        
        if (!config.enabled || !config.url) {
            return
        }
        
        try {
            const url = `${config.url}/${encodeURIComponent(title)}/${encodeURIComponent(body)}`
            
            const response = await axios.get(url, {
                timeout: 30000,
                validateStatus: (status) => status < 500
            })
            
            if (response.status !== 200) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
        } catch (err: any) {
            console.error(`[BarkService] ❌ Bark notification failed:`, err.message || err)
            throw err
        }
    }
}

export default new BarkService()
