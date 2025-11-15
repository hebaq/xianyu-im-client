<template>
  <div class="flex h-100vh overflow-hidden bg-#f5f5f5">
    <!-- 左侧边栏 -->
    <div class="w-250px border-r flex flex-col bg-white">
      <!-- 顶部操作栏 -->
      <div class="p-4 border-b">
        <div class="flex items-center justify-between mb-3">
          <div class="text-lg font-600 text-#1a1a1a">闲鱼IM管理</div>
          <div 
            class="p-2 rounded hover:bg-#f0f0f0 cursor-pointer transition-all"
            title="设置"
            @click="showSettings = true"
          >
            <div class="i-carbon:settings w-5 h-5 text-#666"></div>
          </div>
        </div>
        <Button 
          size="small" 
          class="w-full"
          @click="send2main('xianyuLogin')"
        >
          <div class="i-carbon:add mr-2"></div>
          添加账号
        </Button>
      </div>
      
      <!-- 账号列表 -->
      <div class="flex-1 overflow-y-auto p-2">
        <div class="text-sm text-#666 px-2 py-2 font-500">账号列表 ({{ userList.length }})</div>
        <div
          v-for="user in userList"
          :key="user.userId"
          class="account-item p-3 mb-2 rounded-lg cursor-pointer transition-all relative"
          :class="{ 'active': activeUserId === user.userId }"
          @click="handleSwitchAccount(user.userId)"
        >
          <div class="flex items-center gap-2">
            <div class="relative">
              <Avatar :image="user.avatar" size="normal" shape="circle" />
              <div 
                v-if="user.online"
                class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
              ></div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-500 truncate text-#1a1a1a">{{ user.displayName }}</div>
              <div class="text-xs text-#666 flex items-center gap-1">
                <div 
                  :class="user.online ? 'i-carbon:wifi text-green-500' : 'i-carbon:wifi-off text-gray-400'"
                  class="w-3 h-3"
                ></div>
                {{ user.online ? '在线' : '离线' }}
              </div>
            </div>
            <div 
              v-if="user.unreadCount && user.unreadCount > 0"
              class="flex items-center justify-center min-w-5 h-5 px-1.5 bg-red-500 text-white text-xs font-600 rounded-full"
            >
              {{ user.unreadCount > 99 ? '99+' : user.unreadCount }}
            </div>
          </div>
          
          <!-- 悬停操作按钮 -->
          <div class="account-actions absolute right-2 top-2 flex gap-1">
            <div 
              class="action-btn p-1 rounded hover:bg-red-100 transition-all"
              title="断开连接"
              @click.stop="handleDisconnect(user)"
              v-if="user.online"
            >
              <div class="i-carbon:power text-red-500 w-4 h-4"></div>
            </div>
            <div 
              class="action-btn p-1 rounded hover:bg-green-100 transition-all"
              title="重新连接"
              @click.stop="handleReconnect(user)"
              v-else
            >
              <div class="i-carbon:power text-green-500 w-4 h-4"></div>
            </div>
            <div 
              class="action-btn p-1 rounded hover:bg-red-100 transition-all"
              title="解绑账号"
              @click.stop="handleRemoveUser(user)"
            >
              <div class="i-carbon:close text-red-500 w-4 h-4"></div>
            </div>
          </div>
        </div>
        
        <div v-if="userList.length === 0" class="text-center py-8 text-#999">
          <div class="i-carbon:user-avatar text-4xl mb-2"></div>
          <div class="text-sm">暂无账号</div>
          <div class="text-xs mt-1">点击上方按钮添加</div>
        </div>
      </div>
      
      <!-- 日志面板（可折叠） -->
      <div class="border-t bg-#fafafa">
        <div 
          class="p-3 flex items-center justify-between cursor-pointer hover:bg-#f1f5f9 transition-all"
          @click="showLog = !showLog"
        >
          <div class="flex items-center gap-2">
            <div class="i-carbon:document text-#666"></div>
            <span class="text-sm font-500 text-#666">系统日志</span>
          </div>
          <div :class="showLog ? 'i-carbon:chevron-down' : 'i-carbon:chevron-up'" class="text-#666"></div>
        </div>
        <div v-show="showLog" class="max-h-200px overflow-y-auto p-2 text-xs bg-white">
          <div 
            v-for="log in logList.slice(0, 20)" 
            :key="log.datetime"
            class="mb-2 p-2 rounded hover:bg-#f5f5f5 transition-all"
          >
            <div class="flex items-center justify-between mb-1">
              <Tag :severity="log.status ? 'success' : 'danger'" size="small" class="text-xs">
                {{ log.status ? '成功' : '失败' }}
              </Tag>
              <span class="text-#999 text-xs">{{ dayjs(Number(log.datetime)).format('HH:mm:ss') }}</span>
            </div>
            <div class="text-#666 font-500">{{ log.subject }}</div>
            <div :class="log.status ? 'text-#555' : 'text-red-500'" class="break-all mt-1">
              {{ log.body }}
            </div>
          </div>
          <div v-if="logList.length === 0" class="text-center py-4 text-#999">
            暂无日志
          </div>
        </div>
      </div>
    </div>
    
    <!-- 右侧聊天区域 -->
    <div class="flex-1 relative bg-white">
      <!-- 空状态 -->
      <div 
        v-if="!activeUserId" 
        class="flex items-center justify-center h-full text-#999"
      >
        <div class="text-center">
          <div class="i-carbon:chat text-8xl mb-4 text-#ddd"></div>
          <div class="text-lg font-500 mb-2">欢迎使用闲鱼IM管理后台</div>
          <div class="text-sm">请在左侧选择一个账号开始聊天</div>
        </div>
      </div>
      
      <!-- Webview 容器 -->
      <template v-else>
        <webview
          v-for="user in userList"
          v-show="user.userId === activeUserId"
          :key="user.userId"
          :ref="el => setWebviewRef(user.userId, el)"
          :partition="`persist:user-${user.userId}`"
          allowpopups
          disablewebsecurity
          class="w-full h-full"
          @did-finish-load="handleWebviewLoad(user)"
          @did-fail-load="handleWebviewError"
        />
      </template>
    </div>
    
    <!-- 设置对话框 -->
    <SettingsDialog
      v-model:visible="showSettings"
      :config="barkConfig"
      @save="handleSaveSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { send2main } from '@renderer/utils/ipc-send';
import { addEvent } from '@renderer/utils/ipc.listener';
import { ipcInvoke } from '@renderer/utils/icp-invoke';
import { GooFishUser, LogItem, BarkConfig } from '@shared/types';
import dayjs from 'dayjs';
import SettingsDialog from '@renderer/components/SettingsDialog.vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const userList = ref<GooFishUser[]>([]);
const activeUserId = ref<string>('');
const logList = ref<LogItem[]>([]);
const showLog = ref(false);
const showSettings = ref(false);
const webviewRefs = new Map<string, any>();

// Bark 配置
const barkConfig = ref<BarkConfig>({ enabled: false, url: '' });

function setWebviewRef(userId: string, el: any) {
  if (el) {
    webviewRefs.set(userId, el);
  }
}

async function handleSwitchAccount(userId: string) {
  // 如果点击的是当前账号，则取消选中
  if (activeUserId.value === userId) {
    activeUserId.value = '';
    return;
  }
  
  activeUserId.value = userId;
  console.log('Switching to account:', userId);
  
  // 通知主进程加载该账号的聊天页面
  send2main('loadUserChatPage', userId);
  
  // 标记为已读
  const user = userList.value.find(u => u.userId === userId);
  if (user && user.unread) {
    user.unread = false;
  }
}

function handleDisconnect(user: GooFishUser) {
  send2main('xianyuImLogout', JSON.parse(JSON.stringify(user)));
}

function handleReconnect(user: GooFishUser) {
  send2main('xianyuImLogin', JSON.parse(JSON.stringify(user)));
}

function handleRemoveUser(user: GooFishUser) {
  if (confirm(`确定要解绑账号 ${user.displayName} 吗？`)) {
    send2main('userRemove', JSON.parse(JSON.stringify(user)));
    if (activeUserId.value === user.userId) {
      activeUserId.value = '';
    }
  }
}

async function handleWebviewLoad(user: GooFishUser) {
  console.log(`Webview loaded for user: ${user.displayName}`);
}

function handleWebviewError(event: any) {
  console.error('Webview load failed:', event);
}

async function syncUserList() {
  userList.value = await ipcInvoke('userList');
}

async function loadBarkConfig() {
  barkConfig.value = await ipcInvoke('getBarkConfig');
}

async function handleSaveSettings(config: BarkConfig) {
  // 将 Proxy 对象转换为普通对象
  const plainConfig = {
    enabled: config.enabled,
    url: config.url
  };
  await ipcInvoke('setBarkConfig', plainConfig);
  barkConfig.value = config;
}

onMounted(async () => {
  // 加载 Bark 配置
  await loadBarkConfig();
  document.title = '闲鱼IM管理后台';
  
  // 监听日志事件
  addEvent('log', (payload: LogItem) => {
    logList.value.unshift(payload);
    // 限制日志数量
    if (logList.value.length > 100) {
      logList.value = logList.value.slice(0, 100);
    }
    
    // 对重要操作显示 Toast 提示（添加账号、登录成功、验证成功等）
    const importantSubjects = ['添加成功', '登录成功', '验证成功', '绑定失败', '登录失败', '登录失效', '验证失败'];
    if (importantSubjects.includes(payload.subject)) {
      toast.add({
        severity: payload.status === 1 ? 'success' : 'error',
        summary: payload.subject,
        detail: payload.body,
        life: 3000
      });
    }
  });
  
  // 监听用户列表刷新
  addEvent('refreshUserList', syncUserList);
  
  // 监听播放通知音效
  addEvent('playNotificationSound', () => {
    // 可以在这里播放音效
  });
  
  // 监听账号切换事件
  addEvent('switchToUser', async (data: { userId: string, cookies: any[] }) => {
    activeUserId.value = data.userId;
    await nextTick();
    
    const webview = webviewRefs.get(data.userId);
    if (!webview) {
      console.error('Webview not found for user:', data.userId);
      return;
    }
    
    // 如果已经加载过，直接显示
    if (webview.src) {
      return;
    }
    
    // 首次加载：设置 cookies 后再加载页面
    try {
      const success = await ipcInvoke('setWebviewCookiesSync', {
        partition: webview.partition,
        cookies: data.cookies
      });
      
      if (success) {
        // 等待 cookies 写入后加载页面
        await new Promise(resolve => setTimeout(resolve, 300));
        webview.src = 'https://www.goofish.com/im';
      } else {
        console.error('Failed to set cookies for user:', data.userId);
        webview.src = 'https://www.goofish.com/im';
      }
    } catch (err) {
      console.error('Error loading webview:', err);
      webview.src = 'https://www.goofish.com/im';
    }
  });
  
  // 初始化
  await syncUserList();
  send2main('onMounted');
  
  // 如果有账号，默认选中第一个在线的账号
  if (userList.value.length > 0) {
    const onlineUser = userList.value.find(u => u.online);
    if (onlineUser) {
      handleSwitchAccount(onlineUser.userId);
    } else {
      handleSwitchAccount(userList.value[0].userId);
    }
  }
});
</script>

<style scoped>
.account-item {
  background: #fafafa;
  border: 2px solid transparent;
}

.account-item:hover {
  background: #f1f5f9;
  border-color: #e5e7eb;
}

.account-item.active {
  background: #ecfdf5;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.account-actions {
  display: none;
}

.account-item:hover .account-actions {
  display: flex;
}

.action-btn {
  opacity: 0.7;
}

.action-btn:hover {
  opacity: 1;
}

/* Webview 样式 */
webview {
  display: inline-flex;
  width: 100%;
  height: 100%;
}
</style>
