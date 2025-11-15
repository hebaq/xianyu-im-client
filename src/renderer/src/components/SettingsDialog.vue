<template>
  <Dialog 
    :visible="visible"
    :header="title"
    :style="{ width: '500px' }"
    :modal="true"
    @update:visible="handleClose"
  >
    <div class="settings-content">
      <!-- 通知设置 -->
      <div class="setting-section">
        <h3 class="section-title">通知设置</h3>
        
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <label class="font-500">启用 Bark 通知</label>
            <InputSwitch v-model="localConfig.enabled" />
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-500">Bark 服务器地址</label>
            <InputText 
              v-model="localConfig.url" 
              placeholder="https://api.day.app/your_key"
              :disabled="!localConfig.enabled"
            />
            <small class="text-#666">
              填写完整的 Bark 推送地址，例如：https://api.day.app/your_key
            </small>
          </div>
          
          <div class="bg-blue-50 p-3 rounded text-sm">
            <div class="font-500 mb-1 text-blue-700">💡 使用说明</div>
            <div class="text-#666 space-y-1">
              <div>1. 在 App Store 下载 Bark 应用</div>
              <div>2. 打开应用获取推送地址</div>
              <div>3. 将地址粘贴到上方输入框</div>
              <div>4. 开启通知开关即可接收消息提醒</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 可以在这里添加更多设置板块 -->
    </div>
    
    <template #footer>
      <div class="flex gap-2 justify-end">
        <Button label="取消" severity="secondary" @click="handleCancel" />
        <Button label="保存" @click="handleSave" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputSwitch from 'primevue/inputswitch'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'

interface BarkConfig {
  enabled: boolean
  url: string
}

interface Props {
  visible: boolean
  config: BarkConfig
  title?: string
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'save', config: BarkConfig): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '设置'
})

const emit = defineEmits<Emits>()
const toast = useToast()

const localConfig = ref<BarkConfig>({ ...props.config })

// 监听外部配置变化
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig }
}, { deep: true })

const handleClose = (value: boolean) => {
  emit('update:visible', value)
}

const handleCancel = () => {
  localConfig.value = { ...props.config }
  emit('update:visible', false)
}

const handleSave = () => {
  emit('save', { ...localConfig.value })
  toast.add({
    severity: 'success',
    summary: '保存成功',
    detail: '设置已保存',
    life: 3000
  })
  emit('update:visible', false)
}
</script>

<style scoped>
.settings-content {
  padding: 1rem 0;
}

.setting-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

/* 修复关闭按钮的黑色边框 */
:deep(.p-dialog-header-close) {
  outline: none !important;
  box-shadow: none !important;
}

:deep(.p-dialog-header-close:focus) {
  outline: none !important;
  box-shadow: none !important;
}
</style>
