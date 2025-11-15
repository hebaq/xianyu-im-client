export interface GooFishUser {
    displayName: string
    userId: string
    cookies: any[]
    lastLogin: string
    avatar: string
    accessToken: string;
    online:boolean,
    unread:boolean
    unreadCount?: number  // 未读消息数
    deviceId?: string  // 设备ID，用于保持设备一致性
}

export interface LogItem {
    datetime:string;
    subject:string;
    body:string;
    status: 1 | 0
}
export interface IpcMainEvents {
    userGet:(id:string)=> GooFishUser | undefined;
    userRemove: (user:GooFishUser)=>void;
    userAdd:(user:GooFishUser)=>void;

    xianyuRead: (userId:string)=>void;
    xianyuUnread:(userId:string)=>void;
    xianyuReLogin: (userId:string)=>void;
    xianyuLogin:()=>void;
    xianyuImLogout: (user:GooFishUser)=>void;
    xianyuImLogin: (user:GooFishUser)=>void;

    loadUserChatPage: (userId:string)=>void;
    onMounted:()=>void
}

export interface IpcRendererEvents {
    refreshUserList:()=>void
    log: (log:LogItem)=>void
    playNotificationSound: ()=>void
    switchToUser: (data: { userId: string, cookies: any[] })=>void
}

export interface BarkConfig {
    enabled: boolean;
    url: string;
}

export interface IpcInvokeEvents {
    userList:()=> GooFishUser[];
    setWebviewCookiesSync: (data: { partition: string, cookies: any[] }) => Promise<boolean>;
    getBarkConfig: () => Promise<BarkConfig>;
    setBarkConfig: (config: BarkConfig) => Promise<void>;
}