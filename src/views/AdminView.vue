<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900">插件管理</h1>
            <Badge variant="outline">后台管理</Badge>
          </div>
          <div class="flex items-center space-x-4">
            <Button variant="outline" size="sm" @click="router.push('/')">
              <Home class="h-4 w-4 mr-2" />
              返回首页
            </Button>
            <Button variant="outline" size="sm" @click="handleLogout">
              <LogOut class="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 操作栏 -->
      <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">插件列表</h2>
          <p class="text-sm text-gray-500 mt-1">管理平台所有插件</p>
        </div>
        <div class="flex gap-2">
          <Button @click="loadPlugins" variant="outline" size="sm">
            <RefreshCw class="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button @click="showUploadDialog = true">
            <Upload class="h-4 w-4 mr-2" />
            上传插件
          </Button>
        </div>
      </div>

      <!-- 加载状态 -->
      <Card v-if="loading" class="p-8">
        <div class="text-center text-gray-500">加载中...</div>
      </Card>

      <!-- 错误提示 -->
      <Alert v-else-if="error" variant="destructive" class="mb-6">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <!-- 插件表格 -->
      <Card v-else>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[100px]">ID</TableHead>
                <TableHead>名称</TableHead>
                <TableHead class="hidden md:table-cell">版本</TableHead>
                <TableHead class="hidden lg:table-cell">作者</TableHead>
                <TableHead class="hidden sm:table-cell">状态</TableHead>
                <TableHead class="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="plugins.length === 0">
                <TableCell colspan="6" class="text-center text-gray-500 py-8">
                  暂无插件
                </TableCell>
              </TableRow>
              <TableRow v-for="plugin in plugins" :key="plugin.id">
                <TableCell class="font-medium">{{ plugin.id }}</TableCell>
                <TableCell>
                  <div>
                    <div class="font-medium">{{ plugin.name }}</div>
                    <div class="text-sm text-gray-500 hidden xl:block">
                      {{ plugin.description }}
                    </div>
                  </div>
                </TableCell>
                <TableCell class="hidden md:table-cell">{{ plugin.version }}</TableCell>
                <TableCell class="hidden lg:table-cell">{{ plugin.author }}</TableCell>
                <TableCell class="hidden sm:table-cell">
                  <Badge :variant="getStatusVariant(plugin.status)">
                    {{ getStatusText(plugin.status) }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    <Button
                      v-if="plugin.status === 'STOPPED' || plugin.status === 'DISABLED'"
                      size="sm"
                      variant="outline"
                      @click="handleEnable(plugin.id)"
                    >
                      <Play class="h-3 w-3 mr-1" />
                      启用
                    </Button>
                    <Button
                      v-if="plugin.status === 'ENABLED' || plugin.status === 'STARTED'"
                      size="sm"
                      variant="outline"
                      @click="handleDisable(plugin.id)"
                    >
                      <Square class="h-3 w-3 mr-1" />
                      禁用
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      @click="handleReload(plugin.id)"
                    >
                      <RotateCw class="h-3 w-3 mr-1" />
                      重载
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      @click="handleUninstall(plugin.id)"
                    >
                      <Trash2 class="h-3 w-3 mr-1" />
                      卸载
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </main>

    <!-- 上传插件对话框 -->
    <Dialog v-model:open="showUploadDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>上传插件</DialogTitle>
          <DialogDescription>
            选择插件 JAR 文件上传并安装
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="flex items-center justify-center w-full">
            <label
              for="file-upload"
              class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <p class="mb-2 text-sm text-gray-500">
                  <span class="font-semibold">点击选择文件</span>
                </p>
                <p class="text-xs text-gray-500">JAR 文件</p>
                <p v-if="uploadFile" class="mt-2 text-sm text-gray-700">
                  {{ uploadFile.name }}
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".jar"
                class="hidden"
                @change="handleFileChange"
              />
            </label>
          </div>
          
          <Alert v-if="uploadError" variant="destructive">
            <AlertDescription>{{ uploadError }}</AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showUploadDialog = false">
            取消
          </Button>
          <Button @click="handleUpload" :disabled="!uploadFile || uploading">
            <span v-if="uploading">上传中...</span>
            <span v-else>上传</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  getPluginList,
  enablePlugin,
  disablePlugin,
  uninstallPlugin,
  reloadPlugin,
  installPlugin,
  logout,
  type Plugin,
} from '@/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefreshCw, Upload, Home, LogOut, Play, Square, RotateCw, Trash2 } from 'lucide-vue-next';

const router = useRouter();

const plugins = ref<Plugin[]>([]);
const loading = ref(false);
const error = ref('');

const showUploadDialog = ref(false);
const uploadFile = ref<File | null>(null);
const uploading = ref(false);
const uploadError = ref('');

// 加载插件列表
const loadPlugins = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await getPluginList();
    plugins.value = response.data.data || [];
  } catch (err: any) {
    error.value = err.message || '加载插件列表失败';
  } finally {
    loading.value = false;
  }
};

// 启用插件
const handleEnable = async (id: string) => {
  try {
    await enablePlugin(id);
    await loadPlugins();
  } catch (err: any) {
    alert(err.message || '启用插件失败');
  }
};

// 禁用插件
const handleDisable = async (id: string) => {
  try {
    await disablePlugin(id);
    await loadPlugins();
  } catch (err: any) {
    alert(err.message || '禁用插件失败');
  }
};

// 重新加载插件
const handleReload = async (id: string) => {
  try {
    await reloadPlugin(id);
    await loadPlugins();
  } catch (err: any) {
    alert(err.message || '重新加载插件失败');
  }
};

// 卸载插件
const handleUninstall = async (id: string) => {
  if (!confirm(`确定要卸载插件 ${id} 吗？`)) {
    return;
  }
  
  try {
    await uninstallPlugin(id);
    await loadPlugins();
  } catch (err: any) {
    alert(err.message || '卸载插件失败');
  }
};

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    uploadFile.value = target.files[0] || null;
    uploadError.value = '';
  }
};

// 上传插件
const handleUpload = async () => {
  if (!uploadFile.value) {
    return;
  }
  
  uploading.value = true;
  uploadError.value = '';
  
  try {
    await installPlugin(uploadFile.value);
    showUploadDialog.value = false;
    uploadFile.value = null;
    await loadPlugins();
  } catch (err: any) {
    uploadError.value = err.message || '上传插件失败';
  } finally {
    uploading.value = false;
  }
};

// 退出登录
const handleLogout = async () => {
  try {
    await logout();
  } catch {
    // 忽略错误
  } finally {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  }
};

// 获取状态变体
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'ENABLED':
    case 'STARTED':
      return 'default';
    case 'STOPPED':
      return 'secondary';
    case 'DISABLED':
      return 'outline';
    case 'FAILED':
      return 'destructive';
    default:
      return 'secondary';
  }
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
/* 可以添加额外的样式 */
</style>
