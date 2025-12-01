/**
 * API 响应通用结构
 */
export interface ApiResult<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 插件信息
 */
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string;
  status: 'ENABLED' | 'DISABLED' | 'FAILED' | 'STARTED' | 'STOPPED';
  loadTime?: string;
  startTime?: string;
  frontendEntry?: string;
  apiPrefix?: string;
}

/**
 * 插件列表响应
 */
export type PluginListResponse = ApiResult<Plugin[]>;

/**
 * 插件操作响应
 */
export type PluginActionResponse = ApiResult<void>;

/**
 * 上传插件响应
 */
export type PluginInstallResponse = ApiResult<string>;
