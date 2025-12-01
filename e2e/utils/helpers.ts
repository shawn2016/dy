/**
 * 通用辅助函数
 */
import { Page, expect } from '@playwright/test';

/**
 * 等待元素可见
 */
export async function waitForElement(page: Page, selector: string, timeout: number = 10000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * 等待元素消失
 */
export async function waitForElementHidden(page: Page, selector: string, timeout: number = 10000) {
  await page.waitForSelector(selector, { state: 'hidden', timeout });
}

/**
 * 等待加载完成
 */
export async function waitForLoading(page: Page) {
  // 等待loading元素消失
  try {
    await page.waitForSelector('.el-loading-mask', { state: 'hidden', timeout: 5000 });
  } catch {
    // 如果没有loading元素，继续
  }
  await page.waitForLoadState('networkidle');
}

/**
 * 点击并等待导航
 */
export async function clickAndWaitForNavigation(page: Page, selector: string) {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.click(selector),
  ]);
}

/**
 * 填写表单
 */
export async function fillForm(page: Page, formData: Record<string, string>) {
  for (const [key, value] of Object.entries(formData)) {
    const input = page.locator(`input[name="${key}"], input[placeholder*="${key}"], textarea[name="${key}"]`).first();
    await input.fill(value);
  }
}

/**
 * 验证消息提示
 */
export async function expectMessage(page: Page, message: string | RegExp, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
  const messageSelector = `.el-message--${type}`;
  // 使用first()避免strict mode violation
  const messageLocator = page.locator(messageSelector).first();
  await expect(messageLocator).toBeVisible({ timeout: 5000 });
  
  if (typeof message === 'string') {
    await expect(messageLocator).toContainText(message);
  } else {
    // 如果是正则表达式，使用toMatch
    const messageText = await messageLocator.textContent();
    expect(messageText).toMatch(message);
  }
}

/**
 * 验证错误消息（更灵活，支持多种错误消息格式）
 */
export async function expectErrorMessage(page: Page, expectedText?: string | RegExp) {
  // 使用first()避免strict mode violation
  const errorMessage = page.locator('.el-message--error').first();
  await expect(errorMessage).toBeVisible({ timeout: 5000 });
  
  if (expectedText) {
    if (typeof expectedText === 'string') {
      await expect(errorMessage).toContainText(expectedText);
    } else {
      const messageText = await errorMessage.textContent();
      expect(messageText).toMatch(expectedText);
    }
  }
}

/**
 * 生成随机字符串
 */
export function randomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成随机数字
 */
export function randomNumber(min: number = 1000, max: number = 9999): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 等待API请求完成
 */
export async function waitForAPIResponse(page: Page, urlPattern: string | RegExp) {
  await page.waitForResponse((response) => {
    const url = response.url();
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern);
    }
    return urlPattern.test(url);
  });
}

/**
 * 截图（用于调试）
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

