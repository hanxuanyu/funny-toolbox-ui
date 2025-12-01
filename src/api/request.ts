import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { ApiResult } from './types';

/**
 * 获取 API 基础路径
 * 独立部署模式：使用完整的后端地址 + /api
 * 嵌入式部署模式：使用相对路径 /api
 */
const getBaseURL = (): string => {
  const deploymentMode = import.meta.env.VITE_DEPLOYMENT_MODE || 'standalone';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  
  if (deploymentMode === 'embedded') {
    // 嵌入式部署：使用相对路径
    return '/api';
  } else {
    // 独立部署：使用配置的后端地址
    return apiBaseUrl ? `${apiBaseUrl}/api` : '/api';
  }
};

/**
 * 创建 axios 实例
 */
const request: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  withCredentials: true, // 携带 cookie
});

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResult;
    
    // 如果返回的 code 不是 200，视为业务错误
    if (data.code !== 200) {
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    
    return response;
  },
  (error: AxiosError) => {
    // 处理 HTTP 错误
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        // 未认证，跳转到登录页
        window.location.href = '/login';
        return Promise.reject(new Error('未登录或登录已过期'));
      } else if (status === 403) {
        return Promise.reject(new Error('没有权限'));
      } else if (status === 404) {
        return Promise.reject(new Error('请求的资源不存在'));
      } else if (status >= 500) {
        return Promise.reject(new Error('服务器错误'));
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * 获取后端基础地址（不含 /api）
 * 用于拼接插件静态资源等非 API 路径
 */
export const getBackendBaseURL = (): string => {
  const deploymentMode = import.meta.env.VITE_DEPLOYMENT_MODE || 'standalone';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  
  if (deploymentMode === 'embedded') {
    // 嵌入式部署：使用当前域名
    return '';
  } else {
    // 独立部署：使用配置的后端地址
    return apiBaseUrl || '';
  }
};

export default request;
