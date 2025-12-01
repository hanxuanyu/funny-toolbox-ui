<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="max-w-4xl max-h-[90vh] p-0">
      <DialogHeader class="px-6 pt-6 pb-4 border-b">
        <div class="flex justify-between items-start">
          <div>
            <DialogTitle>{{ plugin?.name }}</DialogTitle>
            <DialogDescription>{{ plugin?.description }}</DialogDescription>
          </div>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="openInNewWindow"
              title="在新窗口中打开"
            >
              <ExternalLink class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogHeader>
      
      <div class="flex-1 overflow-hidden">
        <iframe
          v-if="iframeUrl"
          :src="iframeUrl"
          class="w-full h-[70vh] border-0"
          :title="plugin?.name"
        />
        <div v-else class="flex items-center justify-center h-[70vh] text-gray-500">
          此插件暂无前端页面
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Plugin } from '@/api';
import { getBackendBaseURL } from '@/api/request';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-vue-next';

interface Props {
  plugin: Plugin | null;
  open: boolean;
}

interface Emits {
  (e: 'update:open', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const iframeUrl = computed(() => {
  if (!props.plugin?.frontendEntry) {
    return null;
  }
  
  const backendBaseURL = getBackendBaseURL();
  
  // 如果是完整 URL，直接使用
  if (props.plugin.frontendEntry.startsWith('http://') || 
      props.plugin.frontendEntry.startsWith('https://')) {
    return props.plugin.frontendEntry;
  }
  
  // frontendEntry 通常是 /plugins/xxx/index.html 格式
  // 需要拼接后端地址
  if (props.plugin.frontendEntry.startsWith('/')) {
    return backendBaseURL + props.plugin.frontendEntry;
  }
  
  // 其他情况，使用后端地址 + frontendEntry
  return `${backendBaseURL}/${props.plugin.frontendEntry}`;
});

const openInNewWindow = () => {
  if (iframeUrl.value) {
    window.open(iframeUrl.value, '_blank');
    isOpen.value = false;
  }
};
</script>

<style scoped>
/* 可以添加额外的样式 */
</style>
