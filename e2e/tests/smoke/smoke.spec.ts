/**
 * 冒烟测试 - 核心功能快速验证
 * 用于CI/CD流程中的快速验证
 */
import { test, expect } from '@playwright/test';
import { login } from '../../utils/auth';
import { waitForLoading } from '../../utils/helpers';

test.describe('冒烟测试 - 核心功能验证', () => {
  test('核心流程：登录 -> 查看封面列表 -> 查看个人中心', async ({ page }) => {
    // 1. 登录
    await login(page);
    await expect(page).toHaveURL(/.*cover-management/);
    
    // 2. 验证封面管理页面加载
    await waitForLoading(page);
    await expect(page.locator('.page-title')).toContainText('封面管理');
    
    // 3. 导航到个人中心
    await page.click('.user-info');
    await page.click('text=个人中心');
    
    // 4. 验证个人中心页面加载
    await expect(page).toHaveURL(/.*profile/);
    await expect(page.locator('.card-header')).toContainText('个人中心');
  });

  test('关键功能可用性检查', async ({ page }) => {
    await login(page);
    
    // 检查关键元素是否存在
    await expect(page.locator('button:has-text("新增")')).toBeVisible();
    await expect(page.locator('input[placeholder="搜索封面名称"]')).toBeVisible();
    await expect(page.locator('.user-info')).toBeVisible();
  });
});

