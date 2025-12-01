/**
 * 封面管理功能测试
 */
import { test, expect } from '@playwright/test';
import { login, ensureLoggedIn } from '../../utils/auth';
import { expectMessage, waitForLoading, randomString } from '../../utils/helpers';

test.describe('封面管理', () => {
  test.beforeEach(async ({ page }) => {
    // 确保已登录
    await ensureLoggedIn(page);
    await page.goto('/cover-management');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够加载封面列表', async ({ page }) => {
    // 等待列表加载
    await waitForLoading(page);
    
    // 验证页面标题
    await expect(page.locator('.page-title')).toContainText('封面管理');
    
    // 验证新增按钮存在
    await expect(page.locator('button:has-text("新增")')).toBeVisible();
  });

  test('应该能够创建新封面', async ({ page }) => {
    const coverName = `测试封面_${Date.now()}`;
    const imageUrl = 'https://via.placeholder.com/300x200';
    
    // 点击新增按钮
    await page.click('button:has-text("新增")');
    
    // 等待对话框打开
    await expect(page.locator('.el-dialog__title')).toContainText('新增封面');
    
    // 填写表单
    await page.fill('input[placeholder="请输入封面名称"]', coverName);
    await page.fill('input[placeholder="请输入图片URL"]', imageUrl);
    await page.fill('textarea[placeholder="请输入描述"]', '这是一个测试封面');
    
    // 提交表单
    await page.click('button:has-text("确定")');
    
    // 验证成功提示
    await expectMessage(page, '创建成功', 'success');
    
    // 验证列表中出现新封面
    await waitForLoading(page);
    await expect(page.locator(`text=${coverName}`)).toBeVisible();
  });

  test('应该能够搜索封面', async ({ page }) => {
    await waitForLoading(page);
    
    // 获取第一个封面名称
    const firstCoverName = await page.locator('.cover-name').first().textContent();
    
    if (firstCoverName) {
      // 在搜索框输入
      await page.fill('input[placeholder="搜索封面名称"]', firstCoverName);
      
      // 验证搜索结果
      await expect(page.locator('.cover-name').first()).toContainText(firstCoverName);
    }
  });

  test('应该能够编辑封面', async ({ page }) => {
    await waitForLoading(page);
    
    // 点击第一个封面的编辑按钮
    const editButton = page.locator('.cover-card').first().locator('button:has-text("编辑")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // 等待对话框打开
      await expect(page.locator('.el-dialog__title')).toContainText('编辑封面');
      
      // 修改名称
      const newName = `编辑后的封面_${Date.now()}`;
      await page.fill('input[placeholder="请输入封面名称"]', newName);
      
      // 提交
      await page.click('button:has-text("确定")');
      
      // 验证成功
      await expectMessage(page, '更新成功', 'success');
      
      // 验证列表更新
      await waitForLoading(page);
      await expect(page.locator(`text=${newName}`)).toBeVisible();
    }
  });

  test('应该能够删除封面', async ({ page }) => {
    await waitForLoading(page);
    
    // 点击第一个封面的删除按钮
    const deleteButton = page.locator('.cover-card').first().locator('button:has-text("删除")');
    if (await deleteButton.isVisible()) {
      // 获取封面名称
      const coverName = await page.locator('.cover-card').first().locator('.cover-name').textContent();
      
      await deleteButton.click();
      
      // 确认删除
      await page.click('button:has-text("确定")');
      
      // 验证成功提示
      await expectMessage(page, '删除成功', 'success');
      
      // 验证封面已从列表移除
      if (coverName) {
        await waitForLoading(page);
        await expect(page.locator(`text=${coverName}`)).not.toBeVisible();
      }
    }
  });

  test('表单验证 - 封面名称为空', async ({ page }) => {
    await page.click('button:has-text("新增")');
    await page.fill('input[placeholder="请输入图片URL"]', 'https://via.placeholder.com/300x200');
    await page.click('button:has-text("确定")');
    
    // 验证错误提示
    await expect(page.locator('.el-form-item__error')).toContainText('请输入封面名称');
  });

  test('表单验证 - 图片URL为空', async ({ page }) => {
    await page.click('button:has-text("新增")');
    await page.fill('input[placeholder="请输入封面名称"]', '测试封面');
    await page.click('button:has-text("确定")');
    
    // 验证错误提示
    await expect(page.locator('.el-form-item__error')).toContainText('请输入图片URL');
  });
});

