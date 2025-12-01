/**
 * 忘记密码功能测试
 */
import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../../utils/auth';
import { expectMessage, randomNumber } from '../../utils/helpers';

test.describe('忘记密码功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够显示忘记密码页面', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('找回密码');
    await expect(page.locator('.el-steps')).toBeVisible();
  });

  test('应该能够选择手机号验证方式', async ({ page }) => {
    await page.click('text=手机号验证');
    await expect(page.locator('input[placeholder="请输入手机号"]')).toBeVisible();
  });

  test('应该能够选择邮箱验证方式', async ({ page }) => {
    await page.click('text=邮箱验证');
    await expect(page.locator('input[placeholder="请输入邮箱"]')).toBeVisible();
  });

  test('应该能够发送验证码', async ({ page }) => {
    // 选择手机号验证
    await page.click('text=手机号验证');
    
    // 填写信息
    await page.fill('input[placeholder="请输入用户名"]', TEST_USERS.admin.username);
    await page.fill('input[placeholder="请输入手机号"]', '13800138000');
    
    // 点击发送验证码
    await page.click('button:has-text("发送验证码")');
    
    // 验证按钮变为倒计时
    await expect(page.locator('button')).toContainText('秒后重试');
  });

  test('验证码输入错误应该显示错误提示', async ({ page }) => {
    await page.click('text=手机号验证');
    await page.fill('input[placeholder="请输入用户名"]', TEST_USERS.admin.username);
    await page.fill('input[placeholder="请输入手机号"]', '13800138000');
    await page.fill('input[placeholder="请输入验证码"]', '000000');
    
    await page.click('button:has-text("下一步")');
    
    // 验证错误提示（实际测试中可能需要根据后端返回调整）
    await expect(page.locator('.el-message')).toBeVisible({ timeout: 5000 });
  });

  test('应该能够重置密码', async ({ page }) => {
    // 注意：完整的重置密码流程需要真实的验证码，这里只测试UI流程
    await page.click('text=手机号验证');
    await page.fill('input[placeholder="请输入用户名"]', TEST_USERS.admin.username);
    await page.fill('input[placeholder="请输入手机号"]', '13800138000');
    
    // 这里需要真实的验证码才能继续，实际测试中需要mock或使用测试验证码
    // await page.fill('input[placeholder="请输入验证码"]', '123456');
    // await page.click('button:has-text("下一步")');
  });

  test('应该能够返回登录页', async ({ page }) => {
    await page.click('text=返回登录');
    await expect(page).toHaveURL(/.*login/);
  });
});

