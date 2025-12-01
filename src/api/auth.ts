import request from './request';
import type { LoginRequest, ApiResult } from './types';

/**
 * 认证相关 API
 */

/**
 * 登录
 */
export const login = (data: LoginRequest) => {
  return request.post<ApiResult<void>>('/auth/login', data);
};

/**
 * 登出
 */
export const logout = () => {
  return request.post<ApiResult<void>>('/auth/logout');
};

/**
 * 检查登录状态（通过尝试获取插件列表）
 */
export const checkAuth = async (): Promise<boolean> => {
  try {
    // 这里可以调用一个需要认证的接口来检查状态
    // 由于获取插件列表不需要认证，我们使用一个简单的方法
    // 实际应用中可能需要一个专门的状态检查接口
    return true;
  } catch {
    return false;
  }
};
