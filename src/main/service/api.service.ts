import { cookie2obj } from "../utils"
import xyJsModule from '../libs/xianyu_js_version_2.cjs'
import { API_PATH, APP_KEY, HEADERS } from "../config"
import axios from 'axios'
import qs from 'qs'

export class XyApiService {
    private cookie: Record<string, any>
    private deviceId: string
    private cookieStr: string
    constructor(cookieStr: string, deviceId: string) {
        this.cookieStr = cookieStr
        this.cookie = cookie2obj(this.cookieStr)
        this.deviceId = deviceId
    }

    generateParams(bodyDataStr: string) {
        const t = Date.now()
        const params = {
            jsv: '2.7.2',
            appKey: '34839810',
            t: t,
            sign: '',
            v: '1.0',
            type: 'originaljson',
            accountSite: 'xianyu',
            dataType: 'json',
            timeout: '20000',
            api: 'mtop.taobao.idlemessage.pc.login.token',
            sessionOption: 'AutoLoginOnly',
            spm_cnt: 'a21ybx.im.0.0'
        }
        
        if (!this.cookie['_m_h5_tk']) {
            console.error(`[ApiService] ❌ Cookie '_m_h5_tk' not found!`)
            console.error(`[ApiService] Available cookies:`, Object.keys(this.cookie))
        }
        
        params.sign = xyJsModule.generate_sign(
            t,
            this.cookie['_m_h5_tk'].split('_')[0],
            bodyDataStr
        )
        return params
    }

    async getToken() {
        try {
            const bodyDataStr = JSON.stringify({
                appKey: APP_KEY,
                deviceId: this.deviceId
            })
            const params = this.generateParams(bodyDataStr)
            const response = await axios.post(
                API_PATH,
                qs.stringify({
                    data: bodyDataStr
                }),
                {
                    params,
                    headers: {
                        ...HEADERS,
                        Cookie: this.cookieStr
                    }
                }
            )
            
            // 检查返回状态
            if (response.data.ret && response.data.ret.length > 0) {
                const errorCode = response.data.ret[0]
                
                // 滑块验证
                if (errorCode === 'FAIL_SYS_USER_VALIDATE') {
                    const verifyUrl = response.data.data?.url
                    if (verifyUrl) {
                        return { needVerify: true, verifyUrl }
                    }
                }
                // 登录失效
                else if (errorCode.includes('RGV587_ERROR') || errorCode.includes('被挤爆')) {
                    console.error(`[ApiService] ❌ 登录已失效: ${errorCode}`)
                    return { needRelogin: true, error: '登录已失效，请删除账号重新添加' }
                }
            }
            
            if (!response.data.data || !response.data.data.accessToken) {
                console.error(`[ApiService] ❌ Token获取失败，响应数据:`, response.data)
            }
            
            return response.data.data || {}
        } catch (error) {
            console.error(`[ApiService] ❌ Token获取异常:`, error)
            return {}
        }
    }
}
