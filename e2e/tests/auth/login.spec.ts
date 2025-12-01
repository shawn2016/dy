/**
 * 登录功能测试
 */
import { test, expect } from '@playwright/test';
import { login, logout, TEST_USERS } from '../../utils/auth';
import { expectMessage, waitForLoading } from '../../utils/helpers';

test.describe('登录功能', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前访问登录页
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够成功登录', async ({ page }) => {
    await login(page);
    
    // 验证跳转到封面管理页面
    await expect(page).toHaveURL(/.*cover-management/);
    
    // 验证用户信息显示
    await expect(page.locator('.username')).toContainText('admin');
  });

  test('错误密码应该显示错误提示', async ({ page }) => {
    await page.fill('input[placeholder="请输入用户名"]', TEST_USERS.admin.username);
    await page.fill('input[placeholder="请输入密码"]', 'wrongpassword');
    await page.click('button:has-text("登录")');
    
    // 等待错误消息出现（使用first()只匹配第一个错误消息）
    const errorMessage = page.locator('.el-message--error').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // 验证错误消息包含关键词（用户名、密码、错误、401等）
    const messageText = await errorMessage.textContent();
    expect(messageText).toMatch(/用户名|密码|错误|401|失败/i);
    
    // 验证仍在登录页
    await expect(page).toHaveURL(/.*login/);
  });

  test('空用户名应该显示验证错误', async ({ page }) => {
    await page.fill('input[placeholder="请输入密码"]', TEST_USERS.admin.password);
    await page.click('button:has-text("登录")');
    
    // 验证表单验证提示
    await expect(page.locator('.el-form-item__error')).toBeVisible();
  });

  test('密码显示/隐藏切换功能', async ({ page }) => {
    // 使用更精确的选择器定位密码输入框
    const passwordInput = page.locator('input[placeholder="请输入密码"]');
    const passwordContainer = passwordInput.locator('..').locator('..'); // 获取密码输入框的父容器
    
    // 初始应该是密码类型
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // 填写密码
    await passwordInput.fill('123456');
    
    // 点击密码输入框右侧的眼睛图标
    const eyeIcon = passwordContainer.locator('.password-icon');
    await eyeIcon.click();
    
    // 应该切换为文本类型
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(passwordInput).toHaveValue('123456');
    
    // 再次点击应该切换回密码类型
    await eyeIcon.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('应该能够通过回车键登录', async ({ page }) => {
    await page.fill('input[placeholder="请输入用户名"]', TEST_USERS.admin.username);
    await page.fill('input[placeholder="请输入密码"]', TEST_USERS.admin.password);
    
    // 在密码框按回车
    await page.press('input[placeholder="请输入密码"]', 'Enter');
    
    // 验证登录成功
    await expect(page).toHaveURL(/.*cover-management/, { timeout: 10000 });
  });

  test('登录后应该能够退出', async ({ page }) => {
    // 先登录
    await login(page);
    
    // 退出登录
    await logout(page);
    
    // 验证跳转到登录页
    await expect(page).toHaveURL(/.*login/);
  });
});

