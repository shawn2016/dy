/**
 * API调用工具函数
 * 用于在测试中直接调用后端API（如果需要）
 */
import { APIRequestContext, APIResponse } from '@playwright/test';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5001';

/**
 * 创建API请求上下文
 */
export async function createAPIContext(request: APIRequestContext) {
  return request;
}

/**
 * 登录并获取token
 */
export async function getAuthToken(request: APIRequestContext, username: string, password: string): Promise<string> {
  const response = await request.post(`${API_BASE_URL}/auth/login`, {
    data: {
      username,
      password,
    },
  });
  
  const data = await response.json();
  if (data.code === 200 && data.data?.token) {
    return data.data.token;
  }
  
  throw new Error('登录失败，无法获取token');
}

/**
 * 创建测试用户
 */
export async function createTestUser(request: APIRequestContext, userData: {
  username: string;
  password: string;
  phone: string;
  email?: string;
}): Promise<APIResponse> {
  return await request.post(`${API_BASE_URL}/auth/register`, {
    data: userData,
  });
}

/**
 * 清理测试数据（删除测试用户等）
 */
export async function cleanupTestData(request: APIRequestContext, token: string, userId?: number) {
  // 这里可以添加清理逻辑
  // 注意：实际项目中应该通过API删除测试数据
}

