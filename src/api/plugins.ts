import request from './request';
import type { PluginListResponse, PluginActionResponse, PluginInstallResponse } from './types';

/**
 * 插件管理相关 API
 */

/**
 * 获取插件列表
 */
export const getPluginList = () => {
  return request.get<PluginListResponse>('/platform/plugins');
};

/**
 * 启用插件
 */
export const enablePlugin = (id: string) => {
  return request.post<PluginActionResponse>(`/platform/plugins/${id}/enable`);
};

/**
 * 禁用插件
 */
export const disablePlugin = (id: string) => {
  return request.post<PluginActionResponse>(`/platform/plugins/${id}/disable`);
};

/**
 * 卸载插件
 */
export const uninstallPlugin = (id: string) => {
  return request.delete<PluginActionResponse>(`/platform/plugins/${id}`);
};

/**
 * 重新加载插件
 */
export const reloadPlugin = (id: string) => {
  return request.post<PluginActionResponse>(`/platform/plugins/${id}/reload`);
};

/**
 * 上传并安装插件
 */
export const installPlugin = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return request.post<PluginInstallResponse>('/platform/plugins/install', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
