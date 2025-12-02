<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col relative overflow-hidden">
    <!-- 静态背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-3xl"></div>
      <div class="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
      <div class="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl"></div>
    </div>

    <!-- 主内容区 -->
    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full relative z-10">
      <!-- 网站标题 -->
      <div class="text-center mb-12">
        <h1 class="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 drop-shadow-sm">
          Funny Toolbox
        </h1>
        <p class="text-lg text-gray-600/80">一个可扩展的工具平台</p>
      </div>

      <!-- 搜索框 -->
      <div class="max-w-2xl mx-auto mb-12">
        <div class="relative group">
          <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索你需要的工具..."
            class="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all bg-white/60 backdrop-blur-md shadow-lg hover:shadow-xl hover:bg-white/70"
          />
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600">加载中...</p>
        </div>
      </div>

      <!-- 错误提示 -->
      <Alert v-else-if="error" variant="destructive" class="max-w-2xl mx-auto mb-8 bg-white/60 backdrop-blur-md border-0 shadow-lg">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <!-- 空状态 -->
      <Card v-else-if="activePlugins.length === 0" class="max-w-2xl mx-auto p-12 bg-white/60 backdrop-blur-md border-0 shadow-lg">
        <div class="text-center text-gray-500">
          <p class="text-lg mb-2">
            {{ searchQuery ? '没有找到匹配的工具' : '暂无可用的插件' }}
          </p>
          <p class="text-sm" v-if="!searchQuery">
            <template v-if="isAuthenticated">
              请前往管理后台上传插件
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
          class="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white/60 backdrop-blur-md hover:bg-white/70 hover:scale-[1.02]"
        >
          <CardHeader class="pb-3">
            <div class="flex items-start gap-4">
              <!-- 左侧：图标 -->
              <div class="flex-shrink-0 w-16 h-16 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform bg-gradient-to-br from-blue-100/80 to-indigo-100/80 backdrop-blur-sm rounded-xl shadow-inner">
                <PluginIcon :icon="plugin.icon" :alt="plugin.name" />
              </div>
              
              <!-- 右侧：标题和收藏 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <CardTitle class="text-lg font-semibold group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                    {{ plugin.name }}
                  </CardTitle>
                  <button
                    @click="toggleFavorite(plugin.id, $event)"
                    class="flex-shrink-0 p-1.5 rounded-full transition-all duration-200 hover:bg-white/80 backdrop-blur-sm"
                    :class="isFavorite(plugin.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'"
                    :title="isFavorite(plugin.id) ? '取消收藏' : '收藏'"
                  >
                    <Star 
                      :class="isFavorite(plugin.id) ? 'fill-current' : ''"
                      class="h-4 w-4"
                    />
                  </button>
                </div>
                <div class="flex items-center gap-2 mt-2">
                  <Badge variant="outline" class="text-xs bg-white/50 backdrop-blur-sm border-gray-300/50">
                    v{{ plugin.version }}
                  </Badge>
                  <Badge variant="default" class="text-xs bg-blue-500/80 backdrop-blur-sm">
                    {{ getStatusText(plugin.status) }}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent class="pb-3">
            <CardDescription class="line-clamp-3 text-sm min-h-[3.6rem] text-gray-600">
              {{ plugin.description || '暂无描述' }}
            </CardDescription>
            <div class="mt-3 pt-3 border-t border-gray-200/50">
              <div class="flex items-center text-xs text-gray-500">
                <span class="truncate">作者: {{ plugin.author }}</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter class="pt-0 pb-4 flex gap-2">
            <Button
              variant="default"
              size="sm"
              class="flex-1 bg-blue-500/90 hover:bg-blue-600/90 backdrop-blur-sm shadow-md"
              @click="openPluginInModal(plugin)"
              title="在弹窗中打开"
            >
              <Maximize2 class="h-3.5 w-3.5 mr-1.5" />
              弹窗
            </Button>
            <Button
              variant="outline"
              size="sm"
              class="flex-1 bg-white/50 hover:bg-white/70 backdrop-blur-sm border-gray-300/50"
              @click="openPluginInNewWindow(plugin)"
              title="在新窗口中打开"
            >
              <ExternalLink class="h-3.5 w-3.5 mr-1.5" />
              新窗口
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
    <footer class="mt-auto py-6 border-t border-white/30 bg-white/40 backdrop-blur-md flex-shrink-0 relative z-10 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div class="text-sm text-gray-600">
            <p>© 2025 Funny Toolbox. 一个可扩展的工具平台.</p>
          </div>
          <div class="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              @click="loadPlugins"
              title="刷新"
              class="text-gray-600 hover:text-gray-800 hover:bg-white/50 backdrop-blur-sm"
            >
              <RefreshCw class="h-4 w-4 mr-1.5" />
              刷新
            </Button>
            <Button
              v-if="isAuthenticated"
              variant="ghost"
              size="sm"
              @click="router.push('/admin')"
              class="text-gray-600 hover:text-gray-800 hover:bg-white/50 backdrop-blur-sm"
            >
              <Settings class="h-4 w-4 mr-1.5" />
              管理
            </Button>
            <Button
              v-else
              variant="ghost"
              size="sm"
              @click="router.push('/login')"
              class="text-gray-600 hover:text-gray-800 hover:bg-white/50 backdrop-blur-sm"
            >
              登录
            </Button>
          </div>
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
import { RefreshCw, Settings, Search, Star, Maximize2, ExternalLink } from 'lucide-vue-next';

const router = useRouter();

const plugins = ref<Plugin[]>([]);
const loading = ref(false);
const error = ref('');
const showPluginModal = ref(false);
const selectedPlugin = ref<Plugin | null>(null);
const searchQuery = ref('');
const favorites = ref<Set<string>>(new Set());

// 从本地存储加载收藏
const loadFavorites = () => {
  try {
    const saved = localStorage.getItem('plugin_favorites');
    if (saved) {
      favorites.value = new Set(JSON.parse(saved));
    }
  } catch (err) {
    console.error('加载收藏失败:', err);
  }
};

// 保存收藏到本地存储
const saveFavorites = () => {
  try {
    localStorage.setItem('plugin_favorites', JSON.stringify(Array.from(favorites.value)));
  } catch (err) {
    console.error('保存收藏失败:', err);
  }
};

// 切换收藏状态
const toggleFavorite = (pluginId: string, event: Event) => {
  event.stopPropagation(); // 阻止事件冒泡，避免触发打开插件
  
  if (favorites.value.has(pluginId)) {
    favorites.value.delete(pluginId);
  } else {
    favorites.value.add(pluginId);
  }
  saveFavorites();
};

// 检查是否收藏
const isFavorite = (pluginId: string) => {
  return favorites.value.has(pluginId);
};

// 检查是否已登录
const isAuthenticated = computed(() => {
  return localStorage.getItem('isAuthenticated') === 'true';
});

// 过滤出已启用的插件
const activePlugins = computed(() => {
  // 只显示 ENABLED 状态的插件
  const enabled = plugins.value.filter(p => p.status === 'ENABLED');
  
  // 如果有搜索关键词，进行过滤
  let filtered = enabled;
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = enabled.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.author?.toLowerCase().includes(query)
    );
  }
  
  // 按收藏状态排序：收藏的插件排在前面
  return filtered.sort((a, b) => {
    const aFav = isFavorite(a.id) ? 1 : 0;
    const bFav = isFavorite(b.id) ? 1 : 0;
    return bFav - aFav;
  });
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

// 在模态框中打开插件
const openPluginInModal = (plugin: Plugin) => {
  if (!plugin.frontendEntry) {
    alert('此插件暂无前端页面');
    return;
  }
  
  selectedPlugin.value = plugin;
  showPluginModal.value = true;
};

// 在新窗口中打开插件
const openPluginInNewWindow = (plugin: Plugin) => {
  if (!plugin.frontendEntry) {
    alert('此插件暂无前端页面');
    return;
  }
  
  // 构建插件URL，使用与PluginModal相同的逻辑
  const backendBaseURL = import.meta.env.VITE_API_BASE_URL || '';
  
  let pluginUrl = plugin.frontendEntry;
  
  // 如果不是完整URL，需要拼接后端地址
  if (!pluginUrl.startsWith('http://') && !pluginUrl.startsWith('https://')) {
    if (pluginUrl.startsWith('/')) {
      pluginUrl = backendBaseURL + pluginUrl;
    } else {
      pluginUrl = `${backendBaseURL}/${pluginUrl}`;
    }
  }
  
  window.open(pluginUrl, '_blank', 'noopener,noreferrer');
};

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'ENABLED':
      return '运行中';
    case 'LOADED':
      return '已加载';
    case 'DISABLED':
      return '已禁用';
    case 'ERROR':
      return '错误';
    default:
      return status;
  }
};

onMounted(() => {
  loadFavorites();
  loadPlugins();
});
</script>

<style scoped>
/* 确保卡片内容不超出 */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.leading-tight {
  line-height: 1.3;
}
</style>
