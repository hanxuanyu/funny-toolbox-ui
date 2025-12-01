<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
    <!-- 顶部导航 -->
    <header class="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Funny Toolbox
            </h1>
            <Badge variant="outline" class="hidden sm:inline-flex">工具集合</Badge>
          </div>
          <div class="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="outline"
              size="sm"
              @click="loadPlugins"
              title="刷新"
            >
              <RefreshCw class="h-4 w-4 sm:mr-2" />
              <span class="hidden sm:inline">刷新</span>
            </Button>
            <Button
              v-if="isAuthenticated"
              variant="default"
              size="sm"
              @click="router.push('/admin')"
            >
              <Settings class="h-4 w-4 sm:mr-2" />
              <span class="hidden sm:inline">管理后台</span>
            </Button>
            <Button
              v-else
              variant="outline"
              size="sm"
              @click="router.push('/login')"
            >
              登录
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      <!-- 欢迎区域 -->
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          欢迎使用 Funny Toolbox
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          一个可扩展的工具平台，提供各种实用的小工具
        </p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-gray-500">加载中...</div>
      </div>

      <!-- 错误提示 -->
      <Alert v-else-if="error" variant="destructive" class="max-w-2xl mx-auto mb-8">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <!-- 空状态 -->
      <Card v-else-if="activePlugins.length === 0" class="max-w-2xl mx-auto p-12">
        <div class="text-center text-gray-500">
          <p class="text-lg mb-2">暂无可用的插件</p>
          <p class="text-sm">
            <template v-if="isAuthenticated">
              请前往<router-link to="/admin" class="text-blue-600 hover:underline">管理后台</router-link>上传插件
            </template>
            <template v-else>
              请联系管理员上传插件
            </template>
          </p>
        </div>
      </Card>

      <!-- 插件网格 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="plugin in activePlugins"
          :key="plugin.id"
          class="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
          @click="openPlugin(plugin)"
        >
          <CardHeader class="pb-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <CardTitle class="group-hover:text-blue-600 transition-colors">
                  {{ plugin.name }}
                </CardTitle>
                <CardDescription class="mt-2 line-clamp-2">
                  {{ plugin.description || '暂无描述' }}
                </CardDescription>
              </div>
              <div class="text-3xl ml-2 group-hover:scale-110 transition-transform">
                <PluginIcon :icon="plugin.icon" :alt="plugin.name" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div class="flex items-center justify-between text-sm text-gray-500">
              <div class="flex items-center space-x-2">
                <Badge variant="outline" class="text-xs">
                  v{{ plugin.version }}
                </Badge>
                <Badge variant="default" class="text-xs">
                  {{ getStatusText(plugin.status) }}
                </Badge>
              </div>
              <span class="text-xs">{{ plugin.author }}</span>
            </div>
          </CardContent>
          <CardFooter class="pt-0">
            <Button
              variant="ghost"
              size="sm"
              class="w-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
            >
              打开工具
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>

    <!-- 插件模态框 -->
    <PluginModal
      v-model:open="showPluginModal"
      :plugin="selectedPlugin"
    />

    <!-- 页脚 -->
    <footer class="mt-auto py-8 border-t bg-white/50 backdrop-blur-sm flex-shrink-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center text-sm text-gray-500">
          <p>© 2025 Funny Toolbox. 一个可扩展的工具平台.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getPluginList, type Plugin } from '@/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PluginModal from '@/components/PluginModal.vue';
import PluginIcon from '@/components/PluginIcon.vue';
import { RefreshCw, Settings } from 'lucide-vue-next';

const router = useRouter();

const plugins = ref<Plugin[]>([]);
const loading = ref(false);
const error = ref('');
const showPluginModal = ref(false);
const selectedPlugin = ref<Plugin | null>(null);

// 检查是否已登录
const isAuthenticated = computed(() => {
  return localStorage.getItem('isAuthenticated') === 'true';
});

// 过滤出已启用的插件
const activePlugins = computed(() => {
  return plugins.value.filter(p => p.status === 'ENABLED' || p.status === 'STARTED');
});

// 加载插件列表
const loadPlugins = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await getPluginList();
    plugins.value = response.data.data || [];
    console.log('加载的插件列表:', plugins.value);
    console.log('已启用的插件:', activePlugins.value);
  } catch (err: any) {
    error.value = err.message || '加载插件列表失败';
    console.error('加载插件失败:', err);
  } finally {
    loading.value = false;
  }
};

// 打开插件
const openPlugin = (plugin: Plugin) => {
  if (!plugin.frontendEntry) {
    alert('此插件暂无前端页面');
    return;
  }
  
  selectedPlugin.value = plugin;
  showPluginModal.value = true;
};

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'ENABLED':
    case 'STARTED':
      return '运行中';
    case 'STOPPED':
      return '已停止';
    case 'DISABLED':
      return '已禁用';
    case 'FAILED':
      return '失败';
    default:
      return status;
  }
};

onMounted(() => {
  loadPlugins();
});
</script>

<style scoped>
/* 确保卡片内容不超出 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
