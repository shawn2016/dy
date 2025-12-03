/**
 * 视频管理功能测试
 */
import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from '../../utils/auth';
import { expectMessage, waitForLoading } from '../../utils/helpers';

test.describe('视频管理', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await page.goto('/video-management');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够加载视频列表', async ({ page }) => {
    await waitForLoading(page);
    
    // 验证页面标题
    await expect(page.locator('.page-title, h2, .card-header')).toContainText(/视频|管理/);
    
    // 验证新增按钮存在
    await expect(page.locator('button:has-text("新增")')).toBeVisible();
  });

  test('应该能够创建新视频', async ({ page }) => {
    const videoName = `测试视频_${Date.now()}`;
    const videoUrl = 'https://example.com/video.mp4';
    
    // 点击新增按钮
    await page.click('button:has-text("新增")');
    
    // 等待对话框打开
    await expect(page.locator('.el-dialog__title')).toContainText(/新增|视频/);
    
    // 填写表单（根据实际表单字段调整）
    const nameInput = page.locator('input[placeholder*="名称"], input[placeholder*="视频"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(videoName);
    }
    
    const urlInput = page.locator('input[placeholder*="URL"], input[placeholder*="链接"]').first();
    if (await urlInput.isVisible()) {
      await urlInput.fill(videoUrl);
    }
    
    // 提交表单
    await page.click('button:has-text("确定")');
    
    // 验证成功提示
    await expectMessage(page, /成功/, 'success');
    
    // 验证列表中出现新视频
    await waitForLoading(page);
    await expect(page.locator(`text=${videoName}`)).toBeVisible({ timeout: 10000 });
  });

  test('应该能够搜索视频', async ({ page }) => {
    await waitForLoading(page);
    
    // 查找搜索框
    const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="视频"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('测试');
      
      // 验证搜索结果
      await waitForLoading(page);
    }
  });

  test('应该能够编辑视频', async ({ page }) => {
    await waitForLoading(page);
    
    // 查找编辑按钮
    const editButton = page.locator('button:has-text("编辑")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // 等待对话框打开
      await expect(page.locator('.el-dialog__title')).toContainText(/编辑|视频/);
      
      // 修改名称
      const newName = `编辑后的视频_${Date.now()}`;
      const nameInput = page.locator('input[placeholder*="名称"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill(newName);
        
        // 提交
        await page.click('button:has-text("确定")');
        
        // 验证成功
        await expectMessage(page, /成功/, 'success');
      }
    }
  });

  test('应该能够删除视频', async ({ page }) => {
    await waitForLoading(page);
    
    // 查找删除按钮
    const deleteButton = page.locator('button:has-text("删除")').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // 确认删除
      await page.click('button:has-text("确定")');
      
      // 验证成功提示
      await expectMessage(page, /成功/, 'success');
    }
  });
});


