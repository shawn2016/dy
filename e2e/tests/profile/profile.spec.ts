/**
 * 个人中心功能测试
 */
import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from '../../utils/auth';
import { expectMessage, waitForLoading } from '../../utils/helpers';

test.describe('个人中心', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够查看个人中心', async ({ page }) => {
    // 验证页面标题
    await expect(page.locator('.card-header')).toContainText('个人中心');
    
    // 验证用户信息显示
    await expect(page.locator('h3')).toBeVisible();
    
    // 验证功能列表
    await expect(page.locator('text=修改密码')).toBeVisible();
  });

  test('应该能够修改密码', async ({ page }) => {
    // 点击修改密码
    await page.click('text=修改密码');
    
    // 等待对话框打开
    await expect(page.locator('.el-dialog__title')).toContainText('修改密码');
    
    // 填写表单
    await page.fill('input[placeholder="请输入旧密码"]', '123456');
    await page.fill('input[placeholder="请输入新密码（至少6位）"]', '1234567');
    await page.fill('input[placeholder="请再次输入新密码"]', '1234567');
    
    // 提交
    await page.click('button:has-text("确认修改")');
    
    // 验证成功提示
    await expectMessage(page, '密码修改成功', 'success');
    
    // 注意：修改密码后需要重新登录，这里只是测试修改功能
  });

  test('修改密码 - 旧密码错误', async ({ page }) => {
    await page.click('text=修改密码');
    
    await page.fill('input[placeholder="请输入旧密码"]', 'wrongpassword');
    await page.fill('input[placeholder="请输入新密码（至少6位）"]', '1234567');
    await page.fill('input[placeholder="请再次输入新密码"]', '1234567');
    
    await page.click('button:has-text("确认修改")');
    
    // 验证错误提示
    await expectMessage(page, '旧密码错误', 'error');
  });

  test('修改密码 - 新密码不一致', async ({ page }) => {
    await page.click('text=修改密码');
    
    await page.fill('input[placeholder="请输入旧密码"]', '123456');
    await page.fill('input[placeholder="请输入新密码（至少6位）"]', '1234567');
    await page.fill('input[placeholder="请再次输入新密码"]', '12345678');
    
    await page.click('button:has-text("确认修改")');
    
    // 验证错误提示
    await expect(page.locator('.el-form-item__error')).toContainText('两次输入的密码不一致');
  });

  test('应该能够打开头像上传对话框', async ({ page }) => {
    // 点击头像区域
    await page.click('.avatar-wrapper');
    
    // 验证对话框打开
    await expect(page.locator('.el-dialog__title')).toContainText('更换头像');
  });

  // 注意：头像上传和裁剪的完整测试需要文件上传和图片处理，这里只做基础测试
  test('头像上传对话框应该显示', async ({ page }) => {
    await page.click('.avatar-wrapper');
    
    // 验证上传区域存在
    await expect(page.locator('.el-upload')).toBeVisible();
  });
});

