/**
 * 注册功能测试
 */
import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../../utils/auth';
import { expectMessage, randomString, randomNumber } from '../../utils/helpers';

test.describe('注册功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够成功注册新用户', async ({ page }) => {
    const username = `test_${Date.now()}`;
    const phone = `138${randomNumber(10000000, 99999999)}`;
    
    // 填写注册表单
    await page.fill('input[placeholder="请输入用户名"]', username);
    await page.fill('input[placeholder="请输入手机号"]', phone);
    await page.fill('input[placeholder="请输入密码（至少6位）"]', '123456');
    await page.fill('input[placeholder="请确认密码"]', '123456');
    
    // 提交表单
    await page.click('button:has-text("注册")');
    
    // 验证注册成功并跳转到登录页
    await expectMessage(page, '注册成功', 'success');
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });

  test('密码不一致应该显示错误', async ({ page }) => {
    await page.fill('input[placeholder="请输入用户名"]', `test_${Date.now()}`);
    await page.fill('input[placeholder="请输入手机号"]', `138${randomNumber(10000000, 99999999)}`);
    await page.fill('input[placeholder="请输入密码（至少6位）"]', '123456');
    await page.fill('input[placeholder="请确认密码"]', '1234567');
    
    await page.click('button:has-text("注册")');
    
    // 验证错误提示
    await expect(page.locator('.el-form-item__error')).toContainText('两次输入的密码不一致');
  });

  test('用户名已存在应该显示错误', async ({ page }) => {
    // 使用已存在的用户名
    await page.fill('input[placeholder="请输入用户名"]', TEST_USERS.admin.username);
    await page.fill('input[placeholder="请输入手机号"]', `138${randomNumber(10000000, 99999999)}`);
    await page.fill('input[placeholder="请输入密码（至少6位）"]', '123456');
    await page.fill('input[placeholder="请确认密码"]', '123456');
    
    await page.click('button:has-text("注册")');
    
    // 验证错误提示
    await expectMessage(page, '用户名已存在', 'error');
  });

  test('手机号格式验证', async ({ page }) => {
    await page.fill('input[placeholder="请输入用户名"]', `test_${Date.now()}`);
    await page.fill('input[placeholder="请输入手机号"]', '12345'); // 无效手机号
    await page.fill('input[placeholder="请输入密码（至少6位）"]', '123456');
    await page.fill('input[placeholder="请确认密码"]', '123456');
    
    await page.click('button:has-text("注册")');
    
    // 验证错误提示
    await expect(page.locator('.el-form-item__error')).toContainText('正确的手机号');
  });

  test('密码长度验证', async ({ page }) => {
    await page.fill('input[placeholder="请输入用户名"]', `test_${Date.now()}`);
    await page.fill('input[placeholder="请输入手机号"]', `138${randomNumber(10000000, 99999999)}`);
    await page.fill('input[placeholder="请输入密码（至少6位）"]', '12345'); // 少于6位
    await page.fill('input[placeholder="请确认密码"]', '12345');
    
    await page.click('button:has-text("注册")');
    
    // 验证错误提示
    await expect(page.locator('.el-form-item__error')).toContainText('不能少于6位');
  });

  test('应该能够跳转到登录页', async ({ page }) => {
    await page.click('text=已有账号？立即登录');
    
    await expect(page).toHaveURL(/.*login/);
  });
});

