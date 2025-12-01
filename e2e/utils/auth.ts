/**
 * 认证相关工具函数
 */
import { Page, expect } from '@playwright/test';

// 测试用户配置
export const TEST_USERS = {
  admin: {
    username: 'admin',
    password: '123456',
  },
  newUser: {
    username: `test_${Date.now()}`,
    password: '123456',
    phone: `138${Math.floor(Math.random() * 100000000)}`,
    email: `test_${Date.now()}@example.com`,
  },
};

/**
 * 登录
 */
export async function login(page: Page, username: string = TEST_USERS.admin.username, password: string = TEST_USERS.admin.password) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // 填写用户名
  await page.fill('input[placeholder="请输入用户名"]', username);
  
  // 填写密码
  await page.fill('input[placeholder="请输入密码"]', password);
  
  // 点击登录按钮
  await page.click('button:has-text("登录")');
  
  // 等待跳转到封面管理页面
  await page.waitForURL(/.*cover-management/, { timeout: 10000 });
  
  // 验证登录成功
  await expect(page.locator('.username')).toBeVisible({ timeout: 5000 });
}

/**
 * 退出登录
 */
export async function logout(page: Page) {
  // 点击用户头像下拉菜单
  await page.click('.user-info');
  
  // 点击退出登录
  await page.click('text=退出登录');
  
  // 确认退出
  await page.click('button:has-text("确定")');
  
  // 等待跳转到登录页
  await page.waitForURL(/.*login/, { timeout: 10000 });
}

/**
 * 检查是否已登录
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('.username', { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * 确保已登录（如果未登录则先登录）
 */
export async function ensureLoggedIn(page: Page) {
  if (!(await isLoggedIn(page))) {
    await login(page);
  }
}

