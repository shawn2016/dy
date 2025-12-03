import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright配置文件
 * 参考文档: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 测试目录
  testDir: './tests',
  
  // 测试超时时间（30秒）
  timeout: 30 * 1000,
  
  // 期望超时时间（5秒）
  expect: {
    timeout: 5000
  },
  
  // 并行运行测试
  fullyParallel: true,
  
  // 失败时不继续运行
  forbidOnly: !!process.env.CI,
  
  // CI模式下重试
  retries: process.env.CI ? 2 : 0,
  
  // 并行工作进程数
  workers: process.env.CI ? 1 : undefined,
  
  // 报告配置
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  // 共享配置
  use: {
    // 基础URL
    baseURL: 'http://localhost:3000',
    
    // 浏览器上下文选项
    viewport: { width: 1920, height: 1080 },
    
    // 操作超时时间
    actionTimeout: 10000,
    
    // 导航超时时间
    navigationTimeout: 30000,
    
    // 截图配置
    screenshot: 'only-on-failure',
    
    // 视频配置
    video: 'retain-on-failure',
    
    // 追踪配置
    trace: 'retain-on-failure',
  },

  // 配置测试项目（不同浏览器）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 移动端测试
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 开发服务器配置（如果需要）
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});


